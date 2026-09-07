const apiKey = import.meta.env.VITE_OPENROUTER_KEY;

export const DEFAULT_MODEL = "deepseek/deepseek-chat";

/**
 * Stream chat completions directly from OpenRouter via native fetch and SSE.
 * Handles keep-alive comment lines (e.g. ": OPENROUTER PROCESSING") cleanly.
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages - Array of system/user/assistant messages
 * @param {(delta: string, fullText: string) => void} options.onChunk - Callback invoked as each token arrives
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel streaming if user stops or unmounts
 * @param {string} [options.model] - Model identifier (defaults to deepseek/deepseek-chat)
 * @returns {Promise<string>} - Complete generated response text
 */
export const askMoneyAIStream = async ({
  messages,
  onChunk,
  signal,
  model = DEFAULT_MODEL
}) => {
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
      // response wasn't JSON
    }
    throw new Error(`OpenRouter API error: ${errorDetail}`);
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
      // Keep the last incomplete chunk in buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        // OpenRouter sends keep-alive comments starting with ":" like ": OPENROUTER PROCESSING"
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
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              fullResponse += delta;
              if (onChunk) {
                onChunk(delta, fullResponse);
              }
            }
          } catch {
            // Ignore incomplete JSON chunks
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
