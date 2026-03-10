import React, { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

const ChatMessages = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const cleanMarkdown = (text) => {
    if (!text) return text;
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .trim();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl animate-bounce-slow">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Money Assist AI
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xs sm:max-w-sm">
              Hello! I am your financial assistant. Ask me anything to better manage your finances.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 sm:gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'ai'
                    ? 'bg-linear-to-br from-indigo-500 to-purple-600'
                    : 'bg-gray-700 dark:bg-gray-600'
                }`}
              >
                {m.role === 'ai' ? (
                  <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <User className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                )}
              </div>

              <div
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                } max-w-[85%] sm:max-w-[70%] md:max-w-[60%]`}
              >
                <div
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm text-sm sm:text-base ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {m.role === 'ai' ? cleanMarkdown(m.text) : m.text}
                  </p>

                  {loading && i === messages.length - 1 && m.role === 'ai' && (
                    <span className="animate-pulse ml-1 font-bold text-white dark:text-gray-200">|</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;