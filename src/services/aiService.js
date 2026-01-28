import OpenAI from "openai";

export const askMoneyAI = async (prompt) => {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: import.meta.env.VITE_OPENROUTER_KEY,
    dangerouslyAllowBrowser: true
  });

  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat",
    messages: [
      { role: "system", content: "You are Money Assist AI, helpful and concise." },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices[0].message.content;
};
