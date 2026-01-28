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

  const handleSend = async () => {
    if (!input || loading) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    const { totalIncome, totalExpense, balance } = calculateFinance(financeData);

    const prompt = `
You are Money Assist AI. Format replies using Markdown.
Balance: $${balance}
Income: $${totalIncome}
Expenses: $${totalExpense}
User Question: ${input}
`;

    try {
      const aiText = await askMoneyAI(prompt);

      // Add empty AI message first
      setMessages(prev => [...prev, { role: "ai", text: "" }]);

      // Typing animation (this will stop loading itself)
      typeTextEffect(aiText, setMessages, setLoading);

    } catch (err) {
      console.error("The AI failed because:", err.message);
      setMessages(prev => [...prev, { role: "ai", text: "AI connection error" }]);
      setLoading(false); // only stop loading on error
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
