import { useState, useEffect } from 'react';
import { typeTextEffect } from '../../../../utils/typeEffect';
import { useGetTransactionSummary } from '../../../../hooks/useGetTransactionSummary';
import { askMoneyAI } from '../../../../services/aiService';

export const useAIChat = () => {
  // Load messages from sessionStorage on initial render
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('ai_chat_messages');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending!' }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('ai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const { transactions, userData, getTransactionSummary } = useGetTransactionSummary();
  const summary = getTransactionSummary();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setLoading(true);
    setInput("");

    // Add user message and empty AI message
    const updatedMessages = [
      ...messages,
      { role: "user", text: userText },
      { role: "ai", text: "" }
    ];
    setMessages(updatedMessages);

    const userName = userData?.name || 'User';
    const hasTransactions = transactions.length > 0;

    const prompt = hasTransactions ? `
    You are Money Assist AI, a financial assistant. You have access to the user's transaction data.

    Current Date: ${new Date().toLocaleDateString()}
    User: ${userName}

    USER'S FINANCIAL DATA:
    - Total Income: $${summary.totalIncome || 0}
    - Total Expenses: $${summary.totalExpense || 0}
    - Current Balance: $${summary.balance || 0}
    - Number of Transactions: ${summary.transactionCount || 0}

    Monthly Spending Trend:
    ${summary.monthlyTrend || 'No monthly data'}

    Top Spending Categories:
    ${summary.topCategories || 'No categories yet'}

    Recent Transactions (last 5):
    ${summary.recentTransactions?.map(t =>
      `- ${t.date}: ${t.description || 'No description'} ($${Math.abs(t.amount)}) [${t.category || 'Other'}]`
    ).join('\n') || 'No recent transactions'}

    USER QUESTION: ${userText}

    INSTRUCTIONS:
    1. Answer ONLY the specific question the user asked
    2. Be concise - don't add extra information unless asked
    3. DO NOT use any Markdown formatting (no **, *, #, etc.)
    4. Use plain text only
    5. If the user just says "hi" or "hello", respond with a simple greeting
    6. Use the transaction data only when relevant to the question
    ` : `
    You are Money Assist AI. The user doesn't have any transaction data yet.

    User: ${userName}
    Current Date: ${new Date().toLocaleDateString()}

    USER QUESTION: ${userText}

    INSTRUCTIONS:
    1. Answer ONLY the specific question the user asked
    2. Be concise - don't add extra information unless asked
    3. DO NOT use any Markdown formatting (no **, *, #, etc.)
    4. Use plain text only
    5. If the user just says "hi" or "hello", respond with a simple greeting
    `;

    try {
      const aiText = await askMoneyAI(prompt);

      typeTextEffect(aiText, (newMessages) => {
        setMessages(newMessages);
      }, () => setLoading(false));

    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = "AI connection error. Please try again.";
        return updated;
      });
      setLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    handleSend
  };
};