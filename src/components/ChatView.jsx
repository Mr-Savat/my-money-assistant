import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

const ChatView = ({ messages, input, setInput, handleSend, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  //  Function សម្រាប់សម្អាត Markdown (បើចាំបាច់) 
  const cleanMarkdown = (text) => {
    if (!text) return text;
    
    // លុប Markdown symbols
    return text
      .replace(/\*\*/g, '') // លុប **
      .replace(/\*/g, '')    // លុប *
      .replace(/#/g, '')     // លុប #
      .replace(/`/g, '')     // លុប `
      .replace(/\[/g, '')    // លុប [
      .replace(/\]/g, '')    // លុប ]
      .replace(/\(/g, '')    // លុប (
      .replace(/\)/g, '')    // លុប )
      .trim();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl animate-bounce-slow">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Money Assist AI</h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-xs sm:max-w-sm">
                Hello! I am your financial assistant. Ask me anything to better manage your finances.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 sm:gap-3 ${
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } animate-fadeIn`}
              >
                {/* Avatar - responsive size */}
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === 'ai'
                      ? 'bg-linear-to-br from-indigo-500 to-purple-600'
                      : 'bg-gray-700'
                  }`}
                >
                  {m.role === 'ai' ? (
                    <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <User className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble - responsive width */}
                <div
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  } max-w-[85%] sm:max-w-[70%] md:max-w-[60%]`}
                >
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm text-sm sm:text-base ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word">
                      {m.role === 'ai' ? cleanMarkdown(m.text) : m.text}
                    </p>

                    {loading && i === messages.length - 1 && m.role === 'ai' && (
                      <span className="animate-pulse ml-1 font-bold">|</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

     {/* Input Area - Responsive */}
<div className="border-t bg-white/80 backdrop-blur-md p-2 sm:p-3 md:p-4 pb-safe sticky bottom-0">
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
      className="flex-1 border border-gray-300 rounded-full sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-100 transition-all"
      placeholder={loading ? 'Thinking...' : 'Ask about your finances...'}
    />
    <button
      type="submit"
      disabled={loading || !input.trim()}
      className="bg-indigo-600 text-white rounded-full sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 font-medium text-xs sm:text-sm md:text-base min-w-11 sm:min-w-15"
    >
      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Send</span>
    </button>
  </form>
</div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-5%);
          }
          50% {
            transform: translateY(0);
          }
        }
        .pb-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        /* Extra small devices */
        @media (max-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatView;