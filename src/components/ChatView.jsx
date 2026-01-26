import { Send } from 'lucide-react';

const ChatView = ({ messages, input, setInput, handleSend, loading }) => (
  <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border">
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs p-3 rounded-lg ${
            m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-800 shadow-sm'
          }`}>
            {m.text}
          </div>
        </div>
      ))}
      {loading && <div className="text-xs text-gray-400 animate-pulse">AI កំពុងគិត...</div>}
    </div>
    <form 
      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
      className="p-4 border-t flex gap-2"
    >
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="សួរអ្វីមួយពីហិរញ្ញវត្ថុរបស់អ្នក..."
      />
      <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
        <Send size={20} />
      </button>
    </form>
  </div>
);

export default ChatView;