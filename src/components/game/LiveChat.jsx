/**
 * LiveChat.jsx — Tactical encrypted chat channel for online lobbies.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Send, MessageSquare } from 'lucide-react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { UserAvatar } from '../ui/UserAvatar';
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

  const toggleSB = () => {
    playClickSound();
    setShowSoundboard((p) => !p);
  };

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-zinc-900/80 border-b border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-white font-bold text-xs uppercase tracking-wider truncate">Transmission</span>
          <span className="text-zinc-500 font-mono text-[10px] border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded shrink-0 tabular-nums">
            {messages.length} MSG
          </span>
        </div>
        <motion.button
          type="button"
          onClick={toggleSB}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          aria-pressed={showSoundboard}
          className={`h-7 px-2.5 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer rounded-lg border transition-colors ${
            showSoundboard
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
          }`}
          title="Soundboard"
        >
          <Volume2 size={13} />
          <span className="hidden sm:inline">SFX</span>
        </motion.button>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto overscroll-contain" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">// No active transmissions</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.user_id === profile?.id;
              const titleId = msg.equipped_title || (isMe ? globalEquipped?.title : null) || 'title_novice';
              const titleItem = getStoreItem(titleId) || { name: 'Novice', accent: '#dc2626' };

              return (
                <motion.div
                  key={`${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <UserAvatar
                    username={msg.sender || msg.username || 'Operative'}
                    avatarUrl={msg.avatar_url}
                    size="xs"
                    showBadge={false}
                  />

                  <div className={`flex flex-col min-w-0 max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-semibold text-zinc-300 truncate max-w-[120px]">
                        {msg.sender || msg.username || 'Operative'}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1 rounded uppercase font-bold"
                        style={{
                          color: titleItem.accent || '#dc2626',
                          backgroundColor: `${titleItem.accent || '#dc2626'}15`,
                        }}
                      >
                        [{titleItem.name}]
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs break-words leading-relaxed ${
                        isMe
                          ? 'bg-red-600 text-white rounded-tr-none'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                      }`}
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
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={spring}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90dvh] overflow-y-auto"
            >
              <Soundboard roomId={roomId} onClose={() => setShowSoundboard(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Transmit message..."
          aria-label="Message"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 h-8 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors min-w-0"
          maxLength={100}
        />
        <motion.button
          type="submit"
          disabled={!text.trim()}
          whileHover={text.trim() ? { scale: 1.05 } : undefined}
          whileTap={text.trim() ? { scale: 0.95 } : undefined}
          transition={spring}
          className="h-8 w-8 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Send"
        >
          <Send size={13} />
        </motion.button>
      </form>
    </div>
  );
}

export default LiveChat;
