/**
 * EmoteWheel.jsx — Interactive In-Game Emote Selector & Floating Reaction Trigger.
 * Clean AAA game styling: no glow, Lucide icons, spring animations.
 */
import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, X, Volume2 } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { STORE_ITEMS } from '../../data/shopItems';
import { playClickSound, playEmoteSound, vibrate } from '../../utils/sfx';

const DEFAULT_EMOTES = STORE_ITEMS.filter((i) => i.category === 'emotes');
const spring = { type: 'spring', stiffness: 500, damping: 28 };

export const EmoteWheel = memo(function EmoteWheel({ onEmoteTrigger, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFloatingEmotes, setActiveFloatingEmotes] = useState([]);

  const { inventory } = useEconomyStore();

  const ownedEmoteIds = inventory?.emotes || ['emote_hush'];
  const availableEmotes = DEFAULT_EMOTES.filter(
    (e) => ownedEmoteIds.includes(e.id) || e.price === 200 || e.id === 'emote_hush'
  );

  const displayEmotes = availableEmotes.length > 0 ? availableEmotes : DEFAULT_EMOTES.slice(0, 8);

  const handleSelectEmote = (emote) => {
    playClickSound();
    playEmoteSound(emote.id || emote.name);
    vibrate(30);

    const emoteId = Date.now() + Math.random();
    const newFloatingEmote = {
      id: emoteId,
      icon: emote.icon,
      name: emote.name,
      x: (Math.random() - 0.5) * 60,
    };

    setActiveFloatingEmotes((prev) => [...prev, newFloatingEmote]);

    setTimeout(() => {
      setActiveFloatingEmotes((prev) => prev.filter((e) => e.id !== emoteId));
    }, 2200);

    if (onEmoteTrigger) {
      onEmoteTrigger(emote);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Animated Reaction Container */}
      <div className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex flex-col items-center justify-center font-sans">
        <AnimatePresence>
          {activeFloatingEmotes.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, scale: 0.6, y: 30 }}
              animate={{ opacity: 1, scale: 1.1, y: -70, x: e.x }}
              exit={{ opacity: 0, scale: 0.7, y: -120 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-750 px-4 py-2 rounded-full shadow-lg backdrop-blur-md"
            >
              <span className="text-2xl">
                {e.icon}
              </span>
              <span className="text-xs font-bold text-white tracking-wide font-mono">
                {e.name}!
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-40 font-sans ${className}`}>
        {/* Emote Selector Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={spring}
              className="absolute bottom-16 right-0 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl w-72 max-h-80 overflow-y-auto space-y-2 mb-2"
            >
              <div className="flex items-center justify-between px-2 pb-1 border-b border-zinc-850 sticky top-0 bg-zinc-950 z-10">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smile size={13} className="text-red-500" />
                  Tactical Emotes ({displayEmotes.length})
                </span>
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Volume2 size={11} /> SFX
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {displayEmotes.map((emote) => (
                  <button
                    key={emote.id}
                    type="button"
                    onClick={() => handleSelectEmote(emote)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600/70 hover:bg-zinc-850 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer group"
                    title={emote.name}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {emote.icon}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium truncate max-w-full font-mono">
                      {emote.name.replace(/^[^a-zA-Z0-9]+/, '')}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-12 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-800 hover:border-zinc-700 shadow-md transition-colors cursor-pointer ${
            isOpen ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white' : ''
          }`}
          title="Emote Wheel"
        >
          {isOpen ? <X size={18} /> : <Smile size={20} className="text-red-500" />}
        </motion.button>
      </div>
    </>
  );
});

export default EmoteWheel;
