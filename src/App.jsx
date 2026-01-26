import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import { financeData } from './constants';
import ForecastView from './components/ForecastView';
import BlockchainView from './components/BlockchainView';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([{ role: 'ai', text: 'សួស្តី! ខ្ញុំជាជំនួយការហិរញ្ញវត្ថុ AI។' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Context: ទិន្នន័យហិរញ្ញវត្ថុរបស់ខ្ញុំគឺ ${JSON.stringify(financeData)}។ សំណួរ: ${input}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'ai', text: response.text() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'មានបញ្ហាក្នុងការភ្ជាប់ទៅ AI។' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto p-8">
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