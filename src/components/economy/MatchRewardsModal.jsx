/**
 * MatchRewardsModal.jsx
 * Post-match economic summary modal.
 * Displays Base SC, Victory Bonus, MVP / Vote Bonus, Win Streak Multiplier, and Season XP progress.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchRewardsModal({ isOpen, breakdown, onClose }) {
  if (!isOpen || !breakdown) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 text-center"
        >
          {/* Top celebratory icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 mb-3"
          >
            🪙
          </motion.div>

          <h2 className="text-xl font-black text-white">Match Rewards</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {breakdown.isVictory ? '🏆 Victory Claimed!' : 'Match Completed'}
          </p>

          {/* Level Up Announcement */}
          {breakdown.leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 py-2 px-3 bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/40 rounded-xl text-violet-300 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>⭐</span> Level Up! Reached Tier {breakdown.newLevel}!
            </motion.div>
          )}

          {/* Breakdown List */}
          <div className="my-5 space-y-2 text-xs text-start bg-black/40 border border-white/5 rounded-2xl p-4">
            {/* Base Participation */}
            <div className="flex items-center justify-between">
              <span className="text-white/60">Base Participation</span>
              <span className="text-white font-bold">+{breakdown.baseSC} SC</span>
            </div>

            {/* Victory Bonus */}
            {breakdown.isVictory && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Victory Bonus</span>
                <span className="font-bold">+{breakdown.victorySC} SC</span>
              </div>
            )}

            {/* MVP / Correct Vote */}
            {breakdown.isCorrectVote && (
              <div className="flex items-center justify-between text-blue-400">
                <span>MVP Correct Vote</span>
                <span className="font-bold">+{breakdown.mvpSC} SC</span>
              </div>
            )}

            {/* Win Streak Multiplier */}
            {breakdown.multiplierPercent > 0 && (
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1">
                  🔥 Streak Multiplier (+{breakdown.multiplierPercent}%)
                </span>
                <span className="font-bold">+{breakdown.streakBonusSC} SC</span>
              </div>
            )}

            {/* XP Gained */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-purple-400">
              <span className="flex items-center gap-1">⭐ Season XP</span>
              <span className="font-bold">+{breakdown.xpGained} XP</span>
            </div>

            {/* Total SC Earned */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm">
              <span className="text-white font-extrabold">Total SouL Coins</span>
              <span className="text-amber-400 font-black text-base">
                +{breakdown.totalSC} SC
              </span>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Collect Rewards
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
