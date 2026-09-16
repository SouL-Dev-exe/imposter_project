import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useAuthStore } from '../../store/authStore';

export function LiveChat() {
  const { messages, sendMessage } = useMultiplayerStore();
  const { profile } = useAuthStore();
  const [text, setText] = useState('');
  const chatRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-sm">💬 Room Chat</span>
        <span className="text-white/40 text-xs">{messages.length} msgs</span>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-white/30 text-xs italic">No messages yet. Say hi!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.user_id === profile?.id;
              return (
                <motion.div
                  key={`${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-2 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <img 
                    src={msg.avatar_url} 
                    alt={msg.username} 
                    className="w-8 h-8 rounded-full bg-white/10 shrink-0 border border-white/20"
                  />
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5 px-1">
                      {isMe ? 'You' : msg.username}
                    </span>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-violet-600 text-white rounded-tr-sm' 
                        : 'bg-white/10 text-white rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50"
          maxLength={100}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
