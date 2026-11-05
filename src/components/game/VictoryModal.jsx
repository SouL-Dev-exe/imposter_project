/**
 * VictoryModal.jsx — Winner spotlight: classified commendation.
 */
import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import { ScreenFXOverlay } from '../ui/ScreenFXOverlay';
import { Corners, ClassifiedTag, Particles, PulseRing } from '../ui/HudFrame';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { playVictorySound, vibrate } from '../../utils/sfx';

export function VictoryModal({ isOpen, winner, wordPair, winnerPlayer, onClose }) {
  const { profile } = useAuthStore();
  const { equipped, equippedAvatarStyle } = useEconomyStore();

  useEffect(() => {
    if (!isOpen) return undefined;
    playVictorySound();
    vibrate([100, 50, 100]);
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const winnerName = winnerPlayer?.username || winnerPlayer?.name || profile?.username || 'Winner';
  const winnerAvatarStyle = winnerPlayer?.avatarStyle || equippedAvatarStyle || 'bottts';
  const winnerEquipped = winnerPlayer?.equipped || equipped;

  const titleItem = useMemo(() => {
    const tId = winnerEquipped?.title || 'title_novice';
    return getStoreItem(tId) || { name: 'Novice', icon: '🌱' };
  }, [winnerEquipped?.title]);

  const activeScreenFX = winnerEquipped?.screenFX || 'sfx_gold_lux';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="victory"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <ScreenFXOverlay fxId={activeScreenFX} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Victory"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="relative z-10 w-full max-w-md max-h-[94dvh] overflow-y-auto bg-zinc-950 border border-red-600 p-5 sm:p-6 text-center space-y-5 shadow-[0_0_60px_rgba(220,38,38,0.45)]"
          >
            <Corners size="w-4 h-4" />
            <Particles count={12} />
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_12px_#dc2626]" />

            <div className="relative space-y-1">
              <ClassifiedTag>Commendation</ClassifiedTag>
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]"
              >
                👑
              </motion.div>
              <h2 className="text-3xl font-black text-white uppercase tracking-[0.15em] [text-shadow:0_0_24px_rgba(220,38,38,0.7)] break-words">
                Victory
              </h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.35em]">Match champion spotlight</p>
            </div>

            <div className="relative bg-black border border-red-900/60 p-5 flex flex-col items-center gap-3 shadow-inset-red">
              <Corners size="w-2 h-2" thick="border" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.22)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative">
                <PulseRing className="rounded-full" />
                <UserAvatar username={winnerName} avatarStyle={winnerAvatarStyle} equipped={winnerEquipped} size="2xl" className="shadow-2xl" />
              </div>
              <div className="relative z-10 min-w-0 max-w-full">
                <h3 className="text-2xl font-black text-white tracking-wide break-words">{winnerName}</h3>
                <div className="mt-1.5 flex justify-center">
                  <span className="text-[11px] font-black px-3 py-1 border border-red-500/70 bg-red-950/40 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center gap-1.5 uppercase tracking-wider max-w-full">
                    <span className="shrink-0">{titleItem.icon || '🏆'}</span>
                    <span className="truncate">{titleItem.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {wordPair && (
              <div className="relative bg-black border border-zinc-800 p-3 text-xs grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="min-w-0">
                  <p className="text-zinc-500 uppercase tracking-widest text-[10px]">Civilians</p>
                  <p className="font-black text-white break-words">{wordPair.wordA}</p>
                </div>
                <div className="text-red-600 font-black">VS</div>
                <div className="min-w-0">
                  <p className="text-zinc-500 uppercase tracking-widest text-[10px]">Impostor</p>
                  <p className="font-black text-red-500 break-words">{wordPair.wordB || 'None'}</p>
                </div>
              </div>
            )}

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="relative w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-[0.25em] border border-red-300/50 shadow-[0_0_28px_rgba(220,38,38,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Continue 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VictoryModal;
