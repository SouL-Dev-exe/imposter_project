/**
 * MatchRewardsModal.jsx
 * Post-match economic summary modal.
 * Displays Base SC, Victory Bonus, MVP / Vote Bonus, Win Streak Multiplier, and Season XP progress.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Trophy, Flame, Award, X } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

export default function MatchRewardsModal({ isOpen, breakdown, onClose }) {
  const { t, isRTL } = useLanguageStore();

  if (!isOpen || !breakdown) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={spring}
          className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 text-center space-y-4"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 end-3.5 w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          {/* Top celebratory icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
            <Coins size={28} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t('rewards.title')}</h2>
            <p className="text-zinc-500 text-xs font-mono mt-0.5">
              {breakdown.isVictory ? t('rewards.subtitle') : t('rewards.baseXp')}
            </p>
          </div>

          {/* Level Up Announcement */}
          {breakdown.leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-2 px-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Award size={14} className="text-red-400" />
              <span>{t('rewards.levelUp')} (LVL {breakdown.newLevel})</span>
            </motion.div>
          )}

          {/* Breakdown List */}
          <div className="space-y-2 text-xs text-start bg-zinc-900/60 border border-zinc-850 rounded-xl p-3.5 font-mono">
            {/* Base Participation */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">{t('rewards.baseXp')}</span>
              <span className="text-zinc-200 font-bold">+{breakdown.baseSC} SC</span>
            </div>

            {/* Victory Bonus */}
            {breakdown.isVictory && (
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <Trophy size={12} />
                  <span>{t('rewards.victoryBonus')}</span>
                </span>
                <span className="font-bold">+{breakdown.victorySC} SC</span>
              </div>
            )}

            {/* MVP / Correct Vote */}
            {breakdown.isCorrectVote && (
              <div className="flex items-center justify-between text-blue-400">
                <span>{t('victory.mvp')}</span>
                <span className="font-bold">+{breakdown.mvpSC} SC</span>
              </div>
            )}

            {/* Win Streak Multiplier */}
            {breakdown.multiplierPercent > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1">
                  <Flame size={12} />
                  <span>{t('rewards.streakBonus')} (+{breakdown.multiplierPercent}%)</span>
                </span>
                <span className="font-bold">+{breakdown.streakBonusSC} SC</span>
              </div>
            )}

            {/* XP Gained */}
            <div className="flex items-center justify-between text-zinc-300 pt-2 border-t border-zinc-800">
              <span className="font-sans font-medium text-zinc-400">{t('profile.stats')}</span>
              <span className="font-bold text-amber-400">+{breakdown.xpGained} XP</span>
            </div>

            {/* Total SC */}
            <div className="flex items-center justify-between text-white font-bold pt-1.5 border-t border-zinc-800 text-sm">
              <span className="font-sans font-semibold">{t('rewards.totalEarned')}</span>
              <span className="text-amber-400 font-black">+{breakdown.totalSC} SC</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t('rewards.claim')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
