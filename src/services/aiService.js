const getApiKey = () => import.meta.env.VITE_OPENROUTER_KEY;

// Ultra-fast responsive models verified on OpenRouter
export const DEFAULT_MODEL = "mistralai/mistral-small-24b-instruct-2501";
export const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat"
];

export const AI_MODELS = {
  MISTRAL_FAST: "mistralai/mistral-small-24b-instruct-2501",
  LLAMA_SMART: "meta-llama/llama-3.3-70b-instruct",
  DEEPSEEK: "deepseek/deepseek-chat"
};

/**
 * Single-model streaming attempt
 */
const streamSingleModel = async ({
  messages,
  onChunk,
  signal,
  model
}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing OpenRouter API key. Please check VITE_OPENROUTER_KEY in .env");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7
    }),
    signal
  });

  if (!response.ok) {
    let errorDetail = `HTTP status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson?.error?.message || errorDetail;
    } catch {
      // response was not JSON
    }
    throw new Error(errorDetail);
  }

  if (!response.body) {
    throw new Error("ReadableStream not supported by browser environment.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullResponse = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        // OpenRouter comments like ": OPENROUTER PROCESSING"
        if (!trimmed || trimmed.startsWith(":")) {
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === "[DONE]") {
            return fullResponse;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error.message || "Model provider error during streaming");
            }
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              fullResponse += delta;
              if (onChunk) {
                onChunk(delta, fullResponse);
              }
            }
          } catch (e) {
            if (e.message && e.message.includes("Model provider error")) {
              throw e;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
};

/**
 * Stream chat completions with automatic model fallback for maximum reliability
 */
export const askMoneyAIStream = async ({
  messages,
  onChunk,
  signal,
  model = DEFAULT_MODEL
}) => {
  const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];
  let lastError = null;

  for (const currentModel of modelsToTry) {
    if (signal?.aborted) return "";

    try {
      const result = await streamSingleModel({
        messages,
        onChunk,
        signal,
        model: currentModel
      });

      if (result && result.trim().length > 0) {
        return result;
      }
      console.warn(`[MoneyAI] Empty response from ${currentModel}, trying fallback...`);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err;
      }
      console.warn(`[MoneyAI] Model ${currentModel} error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("No response from AI assistant. Please try again.");
};

/**
 * Non-streaming fallback for backward compatibility
 */
export const askMoneyAI = async (prompt, model = DEFAULT_MODEL) => {
  let fullText = "";
  await askMoneyAIStream({
    messages: [
      { role: "system", content: "You are Money Assist AI, helpful, concise, and accurate." },
      { role: "user", content: prompt }
    ],
    onChunk: (_delta, accumulated) => {
      fullText = accumulated;
    },
    model
  });
  return fullText;
};
