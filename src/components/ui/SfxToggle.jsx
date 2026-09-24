/**
 * SfxToggle.jsx — Global Mute / Unmute button.
 * Reads and writes mute state from sfxState (persisted to localStorage).
 * No external dependencies beyond React and sfx.js.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfxState, playClickSound } from '../../utils/sfx';

export default function SfxToggle({ className = '' }) {
  const [muted, setMuted] = useState(sfxState.muted);
  const [showTooltip, setShowTooltip] = useState(false);

  // Subscribe to external mute changes
  useEffect(() => sfxState.subscribe(setMuted), []);

  const handleToggle = () => {
    // Play click BEFORE toggling so it fires while still unmuted (if toggling off)
    if (!sfxState.muted) playClickSound();
    sfxState.toggle();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1600);
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.button
        id="sfx-mute-toggle"
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.88 }}
        className={`
          relative inline-flex items-center justify-center
          w-8 h-8 rounded-full
          border transition-all duration-200 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400
          ${muted
            ? 'bg-white/5 border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
            : 'bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-violet-400/40 hover:bg-violet-500/10'}
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {muted ? (
            <motion.span
              key="muted"
              initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="absolute text-[15px] select-none"
            >
              🔇
            </motion.span>
          ) : (
            <motion.span
              key="unmuted"
              initial={{ opacity: 0, rotate: 15, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -15, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="absolute text-[15px] select-none"
            >
              🔊
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Toast pop-up feedback */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900/95 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-sm pointer-events-none z-50"
          >
            {muted ? '🔇 Sound off' : '🔊 Sound on'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
