import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import ForecastView from './components/ForecastView';
import BlockchainView from './components/BlockchainView';
import { financeData } from './constants';

import { askMoneyAI } from "./services/aiService";
import { calculateFinance } from "./utils/financeUtils";
import { typeTextEffect } from "./utils/typeEffect";

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'សួស្តី! ខ្ញុំជាជំនួយការហិរញ្ញវត្ថុ AI។' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);


  // Prepare summary of expenses by category for prompt
  const categorySummary = financeData.map(m => {
    const total = Object.values(m.expenses).reduce((a, b) => a + b, 0);
    return `${m.month}: $${total}`;
  }).join(", ");

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

    setLoading(true);
    setInput("");

    // ✅ Add user + empty AI message in ONE update
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

      // ✨ typing effect updates LAST message safely
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



  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        )}
        {activeTab === 'forecast' && <ForecastView />}
        {activeTab === 'blockchain' && <BlockchainView />}
      </main>
    </div>
  );
};

export default App;
