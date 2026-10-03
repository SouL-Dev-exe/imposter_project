import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';

const EMOJIS = ['💀', '🤣', '🇩🇿', '🔥', '👀', '🤔'];

export function ReactionPanel() {
  const { reactions, sendReaction } = useMultiplayerStore();

  return (
    <>
      {/* Floating Bubbles Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => {
            // Random horizontal drift
            const xDrift = (Math.random() - 0.5) * 100;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 100, x: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -300, x: xDrift, scale: [0.5, 1.5, 1, 0.8] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute bottom-24 end-8 text-4xl"
                style={{
                  marginLeft: `${(Math.random() - 0.5) * 50}px`
                }}
              >
                {r.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Reaction Bar — Positioned in the corner to never block chat inputs */}
      <div className="fixed bottom-3 end-4 z-40 bg-gray-900/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg sm:text-xl rounded-full hover:bg-white/10 active:scale-90 transition-all focus:outline-none cursor-pointer"
            title="React"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
