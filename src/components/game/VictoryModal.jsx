/**
 * VictoryModal.jsx — Match Victory & Winner Showcase Spotlight.
 * Displays the winner's avatar with equipped Avatar Style, glowing gold title, and screen FX particles.
 */
import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import { ScreenFXOverlay } from '../ui/ScreenFXOverlay';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { playVictorySound, vibrate } from '../../utils/sfx';

export function VictoryModal({ isOpen, winner, wordPair, winnerPlayer, onClose }) {
  const { profile } = useAuthStore();
  const { equipped, equippedAvatarStyle } = useEconomyStore();

  useEffect(() => {
    if (isOpen) {
      playVictorySound();
      vibrate([100, 50, 100]);
    }
  }, [isOpen]);

  // Determine winner cosmetics
  const winnerName = winnerPlayer?.username || winnerPlayer?.name || profile?.username || 'Winner';
  const winnerAvatarStyle = winnerPlayer?.avatarStyle || equippedAvatarStyle || 'bottts';
  const winnerEquipped = winnerPlayer?.equipped || equipped;

  const equippedTitleItem = useMemo(() => {
    const tId = winnerEquipped?.title || 'title_novice';
    return getStoreItem(tId) || { name: 'Novice', icon: '🌱', accent: '#eab308' };
  }, [winnerEquipped?.title]);

  const activeScreenFX = winnerEquipped?.screenFX || 'sfx_gold_lux';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Victory Screen FX particle overlay */}
        <ScreenFXOverlay fxId={activeScreenFX} />

        {/* Modal Content Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-3xl p-6 text-center space-y-6 shadow-2xl shadow-amber-500/20 overflow-hidden"
        >
          {/* Top Banner Ribbon */}
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl mb-2 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]"
            >
              👑
            </motion.div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider drop-shadow">
              Victory Showcase!
            </h2>
            <p className="text-xs text-amber-200/60 font-semibold mt-1">
              Match Champions Spotlight
            </p>
          </div>

          {/* Winner Spotlight Card */}
          <div className="bg-gradient-to-b from-amber-500/10 to-purple-900/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 relative shadow-inner">
            {/* Glowing Spotlight Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)] pointer-events-none" />

            <UserAvatar
              username={winnerName}
              avatarStyle={winnerAvatarStyle}
              equipped={winnerEquipped}
              size="2xl"
              className="shadow-2xl"
            />

            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white drop-shadow">
                {winnerName}
              </h3>

              {/* Glowing Gold Title */}
              <div className="mt-1 flex justify-center">
                <span
                  className="text-xs font-black px-3 py-1 rounded-full border border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <span>{equippedTitleItem.icon || '🏆'}</span>
                  <span>[{equippedTitleItem.name}]</span>
                </span>
              </div>
            </div>
          </div>

          {/* Secret Words Reveal if available */}
          {wordPair && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex justify-around items-center">
              <div>
                <p className="text-white/40">Civilians</p>
                <p className="font-bold text-blue-400">{wordPair.wordA}</p>
              </div>
              <div className="text-white/20">vs</div>
              <div>
                <p className="text-white/40">Impostor</p>
                <p className="font-bold text-red-400">{wordPair.wordB || 'None'}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            Continue 🚀
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default VictoryModal;
