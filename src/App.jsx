import { useState } from 'react';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import ForecastView from './components/ForecastView';
import BlockchainView from './components/BlockchainView';
import { financeData } from './constants';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AuthView from './components/AuthView';

import { askMoneyAI } from "./services/aiService";
import { calculateFinance } from "./utils/financeUtils";
import { typeTextEffect } from "./utils/typeEffect";

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI financial assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);


  const categorySummary = financeData.map(m => {
    const total = Object.values(m.expenses).reduce((a, b) => a + b, 0);
    return `${m.month}: $${total}`;
  }).join(", ");

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

    const { totalIncome, totalExpense, balance } = calculateFinance(financeData);

    const prompt = `
        You are Money Assist AI. Format replies using Markdown.
        Balance: $${balance}
        Income: $${totalIncome}
        Expenses: $${totalExpense}
        Monthly expense breakdown: ${categorySummary}
        User Question: ${userText}
        `;

    try {
      const aiText = await askMoneyAI(prompt);

      // typing effect updates LAST message safely
      typeTextEffect(aiText, setMessages, () => setLoading(false));

    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = "AI connection error";
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
            <ChatView messages={messages} input={input} setInput={setInput} handleSend={handleSend} loading={loading} />
          } />

          {/* URL: /forecast */}
          <Route path="forecast" element={<ForecastView />} />

          {/* URL: /blockchain */}
          <Route path="blockchain" element={<BlockchainView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
