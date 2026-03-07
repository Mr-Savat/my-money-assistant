import { useState } from 'react';
import { askMoneyAI } from '../../../services/aiService';
import { typeTextEffect } from '../../../utils/typeEffect';

export const useAIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ទាញទិន្នន័យ Transactions ពី localStorage
  const getTransactionSummary = () => {
    const transactions = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

    if (transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        topCategories: 'No categories yet',
        monthlyTrend: 'No monthly data',
        recentTransactions: []
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${month} ${year}`;
      const category = t.category || 'Other';

      if (amount > 0) {
        totalIncome += amount;
      } else {
        const absAmount = Math.abs(amount);
        totalExpense += absAmount;

        categoryMap[category] = (categoryMap[category] || 0) + absAmount;

        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = 0;
        }
        monthlyMap[monthKey] += absAmount;
      }
    });

    const balance = totalIncome - totalExpense;

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt}`)
      .join(', ') || 'No categories yet';

    const monthlyTrend = Object.entries(monthlyMap)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a[0].split(' ')[0]) - months.indexOf(b[0].split(' ')[0]);
      })
      .map(([month, amt]) => `${month}: $${amt}`)
      .join(', ') || 'No monthly data';

    const recentTransactions = transactions.length > 0
      ? [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
      : [];

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      topCategories,
      monthlyTrend,
      recentTransactions
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setLoading(true);
    setInput("");

    setMessages(prev => [
      ...prev,
      { role: "user", text: userText },
      { role: "ai", text: "" }
    ]);

    const transactions = JSON.parse(localStorage.getItem('user_transactions_list') || '[]');
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const summary = getTransactionSummary();
    const userName = userData?.name || 'User';
    const hasTransactions = transactions.length > 0;

    const prompt = hasTransactions ? `
You are Money Assist AI, a financial assistant. You have access to the user's transaction data.

Current Date: ${new Date().toLocaleDateString()}
User: ${userName}

USER'S FINANCIAL DATA:
- Total Income: $${summary.totalIncome}
- Total Expenses: $${summary.totalExpense}
- Current Balance: $${summary.balance}
- Number of Transactions: ${summary.transactionCount}

Monthly Spending Trend:
${summary.monthlyTrend}

Top Spending Categories:
${summary.topCategories}

Recent Transactions (last 5):
${summary.recentTransactions.map(t =>
      `- ${t.date}: ${t.description || 'No description'} ($${Math.abs(t.amount)}) [${t.category || 'Other'}]`
    ).join('\n')}

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
      typeTextEffect(aiText, setMessages, () => setLoading(false));
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