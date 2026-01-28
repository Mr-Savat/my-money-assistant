import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
const ChatView = ({ messages, input, setInput, handleSend, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Money Assist AI
            </h2>
            <p className="text-gray-600 max-w-md">
              សួស្តី! ខ្ញុំជាជំនួយការហិរញ្ញវត្ថុរបស់អ្នក។ សួរអ្វីក៏បានដើម្បីគ្រប់គ្រងហិរញ្ញវត្ថុរបស់អ្នកឱ្យកាន់តែប្រសើរ
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
            >
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`px-2 py-1 ${m.role === 'user'
                ? 'text-right text-indigo-700'
                : 'text-left text-gray-800'
                }`}>

                <article className="prose prose-sm max-w-none text-inherit prose-p:my-1 prose-li:my-0">

                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span className="inline">{children}</span>
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>

                  {loading && i === messages.length - 1 && m.role === 'ai' && (
                    <span className="animate-pulse ml-1 font-bold text-gray-900">
                      ▌
                    </span>
                  )}

                </article>

              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !loading) {
              handleSend();
            }
          }}
          className="p-4 max-w-4xl mx-auto"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50 disabled:text-gray-500 transition-all text-sm"
              placeholder={
                loading
                  ? "កំពុងរង់ចាំការឆ្លើយតប..."
                  : "សួរអ្វីមួយពីហិរញ្ញវត្ថុរបស់អ្នក..."
              }
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-6 py-3 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">ផ្ញើ</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatView;