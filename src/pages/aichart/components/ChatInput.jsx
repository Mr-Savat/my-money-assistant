import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ input, setInput, handleSend, loading }) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 sm:p-3 md:p-4 pb-safe sticky bottom-0 transition-colors duration-300">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) handleSend();
        }}
        className="max-w-4xl mx-auto flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          placeholder={loading ? 'Thinking...' : 'Ask about your finances...'}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white rounded-full cursor-pointer sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 font-medium text-xs sm:text-sm md:text-base min-w-11 sm:min-w-15"
        >
          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;