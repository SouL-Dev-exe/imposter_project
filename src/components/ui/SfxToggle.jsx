/**
 * SfxToggle.jsx — Global Mute / Unmute button.
 * Reads and writes mute state from sfxState (persisted to localStorage).
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { sfxState, playClickSound } from '../../utils/sfx';

export default function SfxToggle({ className = '' }) {
  const [muted, setMuted] = useState(sfxState.muted);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => sfxState.subscribe(setMuted), []);

  const handleToggle = () => {
    if (!sfxState.muted) playClickSound();
    sfxState.toggle();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1600);
  };

  return (
    <div className={`relative inline-flex font-sans ${className}`}>
      <motion.button
        id="sfx-mute-toggle"
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`
          relative inline-flex items-center justify-center
          w-8 h-8 rounded-lg
          border transition-colors duration-150 cursor-pointer
          focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500
          ${muted
            ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'}
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {muted ? (
            <motion.span
              key="muted"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="absolute select-none text-zinc-500"
            >
              <VolumeX size={15} />
            </motion.span>
          ) : (
            <motion.span
              key="unmuted"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="absolute select-none text-zinc-300"
            >
              <Volume2 size={15} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Toast pop-up feedback */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[10px] font-mono font-medium text-white shadow-lg pointer-events-none z-50 flex items-center gap-1.5"
          >
            {muted ? <VolumeX size={11} className="text-zinc-500" /> : <Volume2 size={11} className="text-red-500" />}
            <span>{muted ? 'Sound Muted' : 'Sound Enabled'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
