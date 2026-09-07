import React from 'react';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import { useAIChat } from './components/hooks/useAIChat';
import { Sparkles, RotateCcw } from 'lucide-react';

const AIChat = () => {
  const { messages, input, setInput, loading, handleSend, clearChat } = useAIChat();

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="px-4 py-2.5 sm:px-6 sm:py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Money Assist AI
              </h1>
            </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={clearChat}
            disabled={loading}
            title="Reset conversation"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </header>

      {/* Main Chat Messages */}
      <ChatMessages messages={messages} loading={loading} />

      {/* Message Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        loading={loading}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .pb-safe { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
};

export default AIChat;