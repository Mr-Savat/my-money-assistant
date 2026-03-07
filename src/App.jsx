import { useState, useEffect } from 'react'; // ++++++++++ បន្ថែម useEffect ++++++++++
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import ForecastView from './components/ForecastView';
import BlockchainView from './components/BlockchainView';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AuthView from './components/AuthView';
import SettingsView from './components/Settings/SettingsView';

import { LanguageProvider } from './context/LanguageContext';

import { askMoneyAI } from "./services/aiService";
import { typeTextEffect } from "./utils/typeEffect";

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ++++++++++ State សម្រាប់ Transaction Data ++++++++++
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState(null);

  // ++++++++++ យក Transaction Data ពី localStorage ++++++++++
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadTransactionData();

    // ស្តាប់ការផ្លាស់ប្តូរ
    window.addEventListener('storage', loadTransactionData);
    const interval = setInterval(loadTransactionData, 3000);

    return () => {
      window.removeEventListener('storage', loadTransactionData);
      clearInterval(interval);
    };
  }, []);

  const loadTransactionData = () => {
    // យក User Data
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    // យក Transaction Data
    const saved = localStorage.getItem('user_transactions_list');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions([]);
    }
  };

  // ++++++++++ Function សម្រាប់រៀបចំ Transaction Summary ++++++++++
  const getTransactionSummary = () => {
    if (!transactions || transactions.length === 0) {
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

    // គណនា Total Income/Expense
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

        // Category summary
        categoryMap[category] = (categoryMap[category] || 0) + absAmount;

        // Monthly summary
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = 0;
        }
        monthlyMap[monthKey] += absAmount;
      }
    });

    const balance = totalIncome - totalExpense;

    // រក Top 5 Categories
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt}`)
      .join(', ') || 'No categories yet';

    // Monthly trend
    const monthlyTrend = Object.entries(monthlyMap)
      .sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a[0].split(' ')[0]) - months.indexOf(b[0].split(' ')[0]);
      })
      .map(([month, amt]) => `${month}: $${amt}`)
      .join(', ') || 'No monthly data';

    // Recent transactions (5 ចុងក្រោយ)
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

    const summary = getTransactionSummary();
    const userName = userData?.name || 'User';
    const hasTransactions = transactions.length > 0;

    // ++++++++++ កែ Prompt ថ្មី ++++++++++
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
  3. If the user just says "hi" or "hello", respond with a simple greeting like "Hello! How can I help with your finances today?"
  4. Use the transaction data only when relevant to the question
  5. Format response in Markdown
  ` : `
  You are Money Assist AI. The user doesn't have any transaction data yet.
  
  User: ${userName}
  Current Date: ${new Date().toLocaleDateString()}
  
  USER QUESTION: ${userText}
  
 // ក្នុង INSTRUCTIONS បន្ថែម៖
INSTRUCTIONS:
1. Answer ONLY the specific question the user asked
2. Be concise - don't add extra information unless asked
3. DO NOT use any Markdown formatting (no **, *, #, etc.)
4. Use plain text only
5. If the user just says "hi" or "hello", respond with a simple greeting
6. Use the transaction data only when relevant to the question
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = "/login";
  };

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthView mode="login" />} />
          <Route path="/register" element={<AuthView mode="register" />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout onLogout={handleLogout} /></ProtectedRoute>}>
            {/* URL: / */}
            <Route index element={<DashboardView />} />

            {/* URL: /chat */}
            <Route path="chat" element={
              <ChatView
                messages={messages}
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                loading={loading}
              />
            } />

            {/* URL: /forecast */}
            <Route path="forecast" element={<ForecastView />} />

            {/* URL: /blockchain */}
            <Route path="blockchain" element={<BlockchainView />} />

            {/* URL: /settings */}
            <Route path="settings" element={<SettingsView />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;