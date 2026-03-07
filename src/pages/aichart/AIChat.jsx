import React from 'react';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import { useAIChat } from './hooks/useAIChat';

const AIChat = () => {
  const { messages, input, setInput, loading, handleSend } = useAIChat();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <ChatMessages messages={messages} loading={loading} />
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
};

export default AIChat;