import { useState, useEffect, useRef } from 'react';
import { useGetTransactionSummary } from '../../../../hooks/useGetTransactionSummary';
import { askMoneyAIStream, AI_MODELS } from '../../../../services/aiService';

export const useAIChat = () => {
  // Load messages from sessionStorage on initial render
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ai_chat_messages');
      return saved ? JSON.parse(saved) : [
        { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending or transactions!' }
      ];
    } catch {
      return [
        { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending or transactions!' }
      ];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('ai_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save messages to sessionStorage', e);
    }
  }, [messages]);

  // Clean up ongoing stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const { transactions, userData, getTransactionSummary } = useGetTransactionSummary();
  const summary = getTransactionSummary();

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    // Cancel any previous stream in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setInput('');

    // Append user message and prepare empty AI placeholder for streaming
    const updatedMessages = [
      ...messages,
      { role: 'user', text: userText },
      { role: 'ai', text: '' }
    ];
    setMessages(updatedMessages);

    const userName = userData?.name || 'User';
    const hasTransactions = transactions && transactions.length > 0;

    // Build financial context prompt
    const systemPrompt = hasTransactions ? `
You are Money Assist AI, an intelligent, concise, and friendly personal financial assistant.
You have access to the user's real financial data.

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
USER: ${userName}

FINANCIAL OVERVIEW:
- Total Income: $${summary.totalIncome ?? 0}
- Total Expenses: $${summary.totalExpense ?? 0}
- Current Balance: $${summary.balance ?? 0}
- Transaction Count: ${summary.transactionCount ?? 0}

MONTHLY SPENDING TREND:
${summary.monthlyTrend || 'No monthly trend data'}

TOP SPENDING CATEGORIES:
${summary.topCategories || 'No categories yet'}

RECENT TRANSACTIONS (Last 5):
${summary.recentTransactions?.map(t =>
  `- ${t.date}: ${t.description || 'No description'} ($${Math.abs(t.amount)}) [${t.category || 'Other'}]`
).join('\n') || 'No recent transactions'}

RESPONSE GUIDELINES:
1. Answer the user's question directly and concisely.
2. Format financial amounts cleanly in bold (e.g. **$120.00**).
3. Use clean markdown formatting (bullet points, bold highlights, small comparison lists) to make financial figures easy to read.
4. If asked a simple greeting like "hi" or "hello", reply with a warm, brief greeting and offer help.
5. Reference their transaction numbers accurately when relevant to the question.
` : `
You are Money Assist AI, an intelligent, concise, and friendly personal financial assistant.
The user does not currently have any recorded transactions.

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
USER: ${userName}

RESPONSE GUIDELINES:
1. Answer the user's question directly and concisely.
2. Format text clearly using clean markdown.
3. If they ask about their spending, kindly remind them that no transactions are recorded yet and guide them to add their first transaction.
4. If asked a simple greeting like "hi" or "hello", reply with a warm, brief greeting and offer help.
`;

    // Multi-turn context: take the last 6 messages (excluding the placeholder)
    const history = messages
      .slice(-6)
      .filter(m => m.text && m.text.trim())
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userText }
    ];

    try {
      await askMoneyAIStream({
        messages: apiMessages,
        signal: controller.signal,
        onChunk: (_delta, accumulatedText) => {
          setMessages(prev => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === 'ai') {
              next[lastIndex] = { role: 'ai', text: accumulatedText };
            }
            return next;
          });
        }
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was aborted by user
      }
      console.error('[MoneyAI] Chat stream error:', err);
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'ai') {
          const currentText = updated[lastIndex].text;
          const errorMsg = err.message || "Unable to connect to AI assistant.";
          updated[lastIndex] = {
            role: 'ai',
            text: currentText 
              ? `${currentText}\n\n*(Stream interrupted: ${errorMsg})*`
              : `${errorMsg} Please check your connection and try again.`
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const defaultMsg = [
      { role: 'ai', text: 'Chat history cleared. How can I help you with your finances today?' }
    ];
    setMessages(defaultMsg);
    sessionStorage.setItem('ai_chat_messages', JSON.stringify(defaultMsg));
    setLoading(false);
  };

  return {
    messages,
    input,
    setInput,
    loading,
    handleSend,
    clearChat
  };
};