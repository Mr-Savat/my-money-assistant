import { useState, useEffect, useRef } from 'react';
import { useGetTransactionSummary } from '../../../../hooks/useGetTransactionSummary';
import { askMoneyAIStream } from '../../../../services/aiService';

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
  const animFrameRef = useRef(null);
  const targetTextRef = useRef('');
  const renderedLengthRef = useRef(0);

  // Clean up ongoing stream and animation frame on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
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

    // Initialize animation ticker
    targetTextRef.current = '';
    renderedLengthRef.current = 0;
    let isStreamActive = true;

    // Smooth 60fps text ticker loop
    const tick = () => {
      const target = targetTextRef.current;
      const currentLen = renderedLengthRef.current;

      if (currentLen < target.length) {
        const remaining = target.length - currentLen;
        // Adaptive speed: 1-2 chars for small queues, accelerates smoothly for larger bursts
        const step = Math.max(1, Math.min(Math.ceil(remaining / 3), 14));
        const nextLen = Math.min(currentLen + step, target.length);
        renderedLengthRef.current = nextLen;
        const textSlice = target.slice(0, nextLen);

        setMessages(prev => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === 'ai') {
            next[lastIndex] = { role: 'ai', text: textSlice };
          }
          return next;
        });
      }

      if (isStreamActive || renderedLengthRef.current < targetTextRef.current.length) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

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

    // Multi-turn context: take up to 6 previous messages (excluding the placeholder)
    const rawHistory = messages
      .slice(-6)
      .filter(m => m.text && m.text.trim())
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

    // Avoid starting conversation with assistant message after system message
    const sanitizedHistory = [];
    for (const msg of rawHistory) {
      if (sanitizedHistory.length === 0 && msg.role === 'assistant') {
        continue;
      }
      sanitizedHistory.push(msg);
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: userText }
    ];

    try {
      await askMoneyAIStream({
        messages: apiMessages,
        signal: controller.signal,
        onChunk: (_delta, accumulatedText) => {
          targetTextRef.current = accumulatedText;
        }
      });

      isStreamActive = false;
      // Flush full text upon completion
      const fullText = targetTextRef.current;
      renderedLengthRef.current = fullText.length;

      setMessages(prev => {
        const next = [...prev];
        const lastIndex = next.length - 1;
        if (lastIndex >= 0 && next[lastIndex].role === 'ai') {
          next[lastIndex] = { role: 'ai', text: fullText };
        }
        try {
          sessionStorage.setItem('ai_chat_messages', JSON.stringify(next));
        } catch (e) {
          console.warn('Failed to save to sessionStorage', e);
        }
        return next;
      });
    } catch (err) {
      isStreamActive = false;
      if (err.name === 'AbortError') {
        return; // Request was cancelled by user
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
        try {
          sessionStorage.setItem('ai_chat_messages', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save to sessionStorage', e);
        }
        return updated;
      });
    } finally {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const clearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const defaultMsg = [
      { role: 'ai', text: 'Chat history cleared. How can I help you with your finances today?' }
    ];
    setMessages(defaultMsg);
    try {
      sessionStorage.setItem('ai_chat_messages', JSON.stringify(defaultMsg));
    } catch (e) {
      console.warn('Failed to save to sessionStorage', e);
    }
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