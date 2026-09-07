import React, { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessages = ({ messages, loading }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Direct scroll without forcing window reflow or animation collision
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;
    if (isNearBottom || loading) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar">
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
              Hello! I am your real-time financial assistant. Ask me anything to manage and analyze your finances.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isLastMessage = i === messages.length - 1;
            const isAi = m.role === 'ai';
            const isWaitingFirstToken = isAi && isLastMessage && loading && !m.text;

            return (
              <div
                key={i}
                className={`flex gap-2 sm:gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isAi
                      ? 'bg-linear-to-br from-indigo-500 to-purple-600'
                      : 'bg-gray-700 dark:bg-gray-600'
                  }`}
                >
                  {isAi ? (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>

                <div
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  } max-w-[88%] sm:max-w-[78%] md:max-w-[70%]`}
                >
                  <div
                    className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-xs text-sm sm:text-base ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {isAi ? (
                      isWaitingFirstToken ? (
                        <div className="flex items-center gap-1.5 py-1 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                        </div>
                      ) : (
                        <div className={`prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed ${
                          loading && isLastMessage ? 'streaming-cursor' : ''
                        }`}>
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                              strong: ({ children }) => (
                                <strong className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  {children}
                                </strong>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700">
                                    {children}
                                  </table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-left font-semibold text-gray-700 dark:text-gray-300">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-2.5 py-1.5 text-gray-600 dark:text-gray-300">
                                  {children}
                                </td>
                              )
                            }}
                          >
                            {m.text || ''}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatMessages;