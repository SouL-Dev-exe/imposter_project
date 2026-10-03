import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { UserAvatar } from '../ui/UserAvatar';
import { getStoreItem } from '../../data/economyCatalog';
import { listenToSoundEmotes } from './ChatSoundboard';
import Soundboard from '../Soundboard';

export function LiveChat() {
  const { messages, sendMessage, roomId } = useMultiplayerStore();
  const { profile } = useAuthStore();
  const globalEquipped = useEconomyStore((s) => s.equipped);
  const [text, setText] = useState('');
  const [showSoundboard, setShowSoundboard] = useState(false);
  const chatRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen to remote sound emotes
  useEffect(() => {
    if (roomId) {
      const unsub = listenToSoundEmotes(roomId);
      return unsub;
    }
  }, [roomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
      {/* Header with Soundboard Trigger */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm flex items-center gap-1.5">💬 Room Chat</span>
          <span className="text-white/40 text-[11px] bg-white/5 px-2 py-0.5 rounded-full">{messages.length} msgs</span>
        </div>

        <button
          type="button"
          onClick={() => setShowSoundboard((prev) => !prev)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
            showSoundboard
              ? 'bg-indigo-600 text-white shadow-indigo-500/30'
              : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40'
          }`}
          title="Toggle Soundboard"
        >
          <span>🔊</span>
          <span>Soundboard</span>
        </button>
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
              const titleId = msg.equipped_title || (isMe ? globalEquipped?.title : null) || 'title_novice';
              const titleItem = getStoreItem(titleId) || { name: 'Novice', icon: '🌱', accent: '#3b82f6' };

              return (
                <motion.div
                  key={`${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-2.5 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <UserAvatar
                    username={msg.username || 'Player'}
                    avatarUrl={msg.avatar_url}
                    equipped={isMe ? globalEquipped : msg.equipped}
                    size="sm"
                  />
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                        {isMe ? 'You' : msg.username}
                      </span>
                      <span
                        className="text-[9px] font-extrabold px-1.5 py-0.2 rounded border shadow-sm"
                        style={{
                          color: titleItem.accent || '#3b82f6',
                          borderColor: `${titleItem.accent || '#3b82f6'}50`,
                          backgroundColor: `${titleItem.accent || '#3b82f6'}20`,
                        }}
                      >
                        {titleItem.icon} [{titleItem.name}]
                      </span>
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-violet-600 text-white rounded-tr-sm shadow-md' 
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

      {/* Floating Soundboard overlay floating cleanly above chat input bar */}
      <AnimatePresence>
        {showSoundboard && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 start-2 end-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/95 backdrop-blur-md max-h-[50vh] flex flex-col"
          >
            <Soundboard roomId={roomId} onClose={() => setShowSoundboard(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input & Soundboard trigger */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-white/5 border-t border-white/10 flex items-center gap-2 relative z-30">
        <button
          type="button"
          onClick={() => setShowSoundboard((prev) => !prev)}
          className={`h-9 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            showSoundboard
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40'
          }`}
          title="Soundboard"
        >
          <span>🔊</span>
          <span className="font-semibold">Soundboard</span>
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 min-w-0"
          maxLength={100}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="h-9 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 text-sm font-bold disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
