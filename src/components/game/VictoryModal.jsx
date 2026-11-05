/**
 * VictoryModal.jsx — Winner spotlight: classified commendation.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Check, X, Award } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { ScreenFXOverlay } from '../ui/ScreenFXOverlay';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { useLanguageStore } from '../../store/languageStore';
import { getStoreItem } from '../../data/economyCatalog';
import { playVictorySound, vibrate } from '../../utils/sfx';

const spring = { type: 'spring', stiffness: 450, damping: 28 };

export function VictoryModal({ isOpen, winner, wordPair, winnerPlayer, onClose }) {
  const { profile } = useAuthStore();
  const { equipped, equippedAvatarStyle } = useEconomyStore();
  const { t } = useLanguageStore();

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
    return getStoreItem(tId) || { name: 'Novice', accent: '#dc2626' };
  }, [winnerEquipped?.title]);

  const activeScreenFX = winnerEquipped?.screenFX || 'sfx_gold_lux';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="victory"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          <ScreenFXOverlay fxId={activeScreenFX} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Victory"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={spring}
            className="relative z-10 w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 end-3.5 w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="space-y-1 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400 mb-2">
                <Crown size={28} />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-red-500 font-semibold">
                {t('victory.title')}
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {winner === 'civilians' ? t('result.civiliansWin') : t('result.impostorWins')}
              </h2>
            </div>

            {/* Winner spotlight profile card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-2.5">
              <UserAvatar
                username={winnerName}
                avatarStyle={winnerAvatarStyle}
                equipped={winnerEquipped}
                size="xl"
              />

              <div className="min-w-0 max-w-full">
                <h3 className="text-lg font-bold text-white tracking-wide truncate">{winnerName}</h3>
                <div className="mt-1 flex justify-center">
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1"
                    style={{
                      color: titleItem.accent || '#dc2626',
                      borderColor: `${titleItem.accent || '#dc2626'}40`,
                      backgroundColor: `${titleItem.accent || '#dc2626'}15`,
                    }}
                  >
                    <Award size={11} />
                    <span>{titleItem.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {wordPair && (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 text-xs grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-mono">
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 uppercase">{t('result.civilians')}</p>
                  <p className="font-bold text-white truncate">{wordPair.wordA}</p>
                </div>
                <div className="text-zinc-600 font-bold">/</div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 uppercase">{t('result.impostor')}</p>
                  <p className="font-bold text-red-400 truncate">{wordPair.wordB || (t('result.none'))}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {t('victory.close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VictoryModal;
