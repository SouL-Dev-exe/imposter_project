import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { UserAvatar } from '../ui/UserAvatar';
import { Corners } from '../ui/HudFrame';
import { getStoreItem } from '../../data/economyCatalog';
import { listenToSoundEmotes } from './ChatSoundboard';
import Soundboard from '../Soundboard';
import { playClickSound } from '../../utils/sfx';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

export function LiveChat() {
  const { messages, sendMessage, roomId } = useMultiplayerStore();
  const { profile } = useAuthStore();
  const globalEquipped = useEconomyStore((s) => s.equipped);
  const [text, setText] = useState('');
  const [showSoundboard, setShowSoundboard] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return undefined;
    return listenToSoundEmotes(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!showSoundboard) return undefined;
    const onKey = (e) => e.key === 'Escape' && setShowSoundboard(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSoundboard]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const toggleSB = () => { playClickSound(); setShowSoundboard((p) => !p); };

  const sbBtn = (extra = '') => (
    <motion.button
      type="button"
      onClick={toggleSB}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      transition={spring}
      aria-pressed={showSoundboard}
      className={`h-9 px-3 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer border transition-colors ${
        showSoundboard
          ? 'bg-red-600 text-white border-red-400 shadow-[0_0_14px_rgba(220,38,38,0.5)]'
          : 'bg-black text-zinc-300 border-zinc-700 hover:border-red-600 hover:text-white'
      } ${extra}`}
      title="Soundboard"
    >
      <span>🔊</span>
      <span className="hidden sm:inline">Soundboard</span>
    </motion.button>
  );

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-black border border-red-900/50 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.12)] font-mono">
      <Corners />

      {/* Header */}
      <div className="bg-zinc-950 border-b border-red-900/40 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 bg-red-600 animate-pulse shadow-[0_0_6px_#dc2626] shrink-0" />
          <span className="text-white font-black text-xs uppercase tracking-[0.2em] truncate">Secure channel</span>
          <span className="text-zinc-500 text-[10px] border border-zinc-800 px-1.5 py-0.5 shrink-0 tabular-nums">{messages.length} MSG</span>
        </div>
        {sbBtn()}
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 min-h-0 p-3 sm:p-4 space-y-3.5 overflow-y-auto overscroll-contain" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-600 text-xs uppercase tracking-[0.3em]">// No transmissions</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.user_id === profile?.id;
              const titleId = msg.equipped_title || (isMe ? globalEquipped?.title : null) || 'title_novice';
              const titleItem = getStoreItem(titleId) || { name: 'Novice', icon: '🌱' };

              return (
                <motion.div
                  key={`${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className={`flex gap-2.5 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <UserAvatar username={msg.username || 'Player'} avatarUrl={msg.avatar_url} equipped={isMe ? globalEquipped : msg.equipped} size="sm" />
                  <div className={`flex flex-col min-w-0 max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-1.5 mb-0.5 px-0.5 min-w-0 max-w-full ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">{isMe ? 'You' : msg.username}</span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 border border-red-900/70 text-red-400 bg-black shrink-0 max-w-[110px] truncate">
                        {titleItem.icon} {titleItem.name}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 text-sm break-words [overflow-wrap:anywhere] max-w-full border ${
                        isMe
                          ? 'bg-red-600 text-white border-red-400/60 shadow-[0_0_14px_rgba(220,38,38,0.3)]'
                          : 'bg-zinc-900 text-zinc-100 border-zinc-800'
                      }`}
                      style={{ clipPath: isMe
                        ? 'polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)'
                        : 'polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px))' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Soundboard overlay */}
      <AnimatePresence>
        {showSoundboard && (
          <motion.div
            key="sb"
            className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSoundboard(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90dvh] overflow-y-auto shadow-[0_0_50px_rgba(220,38,38,0.25)]"
            >
              <Soundboard roomId={roomId} onClose={() => setShowSoundboard(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-zinc-950 border-t border-red-900/40 flex items-center gap-2 relative z-30 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Transmit message…"
          aria-label="Message"
          className="flex-1 bg-black border border-zinc-800 px-3 h-9 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:shadow-[0_0_12px_rgba(220,38,38,0.3)] transition-all min-w-0"
          maxLength={100}
        />
        <motion.button
          type="submit"
          disabled={!text.trim()}
          whileHover={text.trim() ? { scale: 1.05 } : undefined}
          whileTap={text.trim() ? { scale: 0.92 } : undefined}
          transition={spring}
          className="h-9 bg-red-600 hover:bg-red-500 text-white border border-red-400/60 px-4 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:shadow-none shadow-[0_0_14px_rgba(220,38,38,0.4)] shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
