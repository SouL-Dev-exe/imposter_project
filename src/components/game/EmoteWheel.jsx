/**
 * EmoteWheel.jsx — Interactive In-Game Emote Selector & Floating Toast Trigger.
 * Enables triggering animated floating emotes during active game rounds & voting phases.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { playClickSound, vibrate } from '../../utils/sfx';

const DEFAULT_EMOTES = [
  { id: 'emote_hush', icon: '🤫', name: 'Hush' },
  { id: 'emote_inspect', icon: '🔍', name: 'Inspect' },
  { id: 'emote_crown', icon: '👑', name: 'Crown' },
  { id: 'emote_mystery', icon: '🎭', name: 'Mystery' },
  { id: 'emote_on_fire', icon: '🔥', name: 'On Fire' },
  { id: 'emote_mind_blown', icon: '🤯', name: 'Mind Blown' },
  { id: 'emote_target', icon: '🎯', name: 'Target' },
  { id: 'emote_laugh', icon: '😂', name: 'Laugh' },
];

export function EmoteWheel({ onEmoteTrigger, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFloatingEmotes, setActiveFloatingEmotes] = useState([]);

  const { inventory, equipped } = useEconomyStore();

  // Gather owned emotes from inventory + defaults
  const ownedEmoteItems = (inventory?.emotes || [])
    .map((id) => getStoreItem(id))
    .filter(Boolean);

  const availableEmotes = ownedEmoteItems.length > 0
    ? ownedEmoteItems
    : DEFAULT_EMOTES;

  const handleSelectEmote = (emote) => {
    playClickSound();
    vibrate(40);

    const emoteId = Date.now() + Math.random();
    const newFloatingEmote = {
      id: emoteId,
      icon: emote.icon,
      name: emote.name,
      x: (Math.random() - 0.5) * 60, // slight lateral drift
    };

    // Add floating animated emote
    setActiveFloatingEmotes((prev) => [...prev, newFloatingEmote]);

    // Auto cleanup after 2.5s
    setTimeout(() => {
      setActiveFloatingEmotes((prev) => prev.filter((e) => e.id !== emoteId));
    }, 2500);

    if (onEmoteTrigger) {
      onEmoteTrigger(emote);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Animated Emotes Display Container */}
      <div className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex flex-col items-center justify-center">
        <AnimatePresence>
          {activeFloatingEmotes.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, scale: 0.2, y: 40 }}
              animate={{ opacity: 1, scale: 1.4, y: -80, x: e.x }}
              exit={{ opacity: 0, scale: 0.5, y: -140 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="flex items-center gap-2 bg-slate-900/90 border border-violet-500/50 px-4 py-2 rounded-full shadow-2xl shadow-violet-500/50 backdrop-blur-md"
            >
              <span className="text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-bounce">
                {e.icon}
              </span>
              <span className="text-sm font-extrabold text-white tracking-wide">
                {e.name}!
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        {/* Emote Selector Radial Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 bg-slate-900/95 border border-violet-500/40 rounded-3xl p-3 shadow-2xl backdrop-blur-xl w-64 space-y-2 mb-2"
            >
              <div className="flex items-center justify-between px-2 pb-1 border-b border-white/10">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider flex items-center gap-1">
                  🎭 Express Emote
                </span>
                <span className="text-[10px] text-violet-400 font-semibold">
                  Tap to pop!
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {availableEmotes.map((emote) => (
                  <button
                    key={emote.id}
                    type="button"
                    onClick={() => handleSelectEmote(emote)}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500 hover:bg-violet-600/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group active:scale-95"
                    title={emote.name}
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">
                      {emote.icon}
                    </span>
                    <span className="text-[9px] text-white/70 font-bold truncate max-w-full">
                      {emote.name.replace(/^[^a-zA-Z0-9]+/, '')}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-violet-600/40 border-2 border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
            isOpen ? 'rotate-45' : ''
          }`}
          title="Emote Wheel"
        >
          {isOpen ? '✕' : '🎭'}
        </button>
      </div>
    </>
  );
}

export default EmoteWheel;
