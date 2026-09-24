/**
 * DailyQuestsModal.jsx
 * Displays the 7-day Daily Login Streak ladder and Daily/Weekly quests.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { STREAK_LADDER } from '../../data/economyCatalog';

export default function DailyQuestsModal({ isOpen, onClose }) {
  const {
    streakDays,
    dailyQuests,
    weeklyQuests,
    claimQuest,
    soulCoins,
    cratesCount,
  } = useEconomyStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                🔥
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  Daily Streak & Quests
                </h2>
                <p className="text-white/40 text-xs">
                  {streakDays} Day Streak · Earn daily SouL Coins & Crates
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 space-y-6 flex-1">
            {/* 7-Day Login Streak Ladder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>📅</span> 7-Day Streak Ladder
                </span>
                <span className="text-xs text-white/40">Current: Day {streakDays}</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {STREAK_LADDER.map((step) => {
                  const isCurrent = step.day === streakDays;
                  const isCompleted = step.day < streakDays;
                  return (
                    <div
                      key={step.day}
                      className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-105'
                          : isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <span className="text-[10px] font-bold">D{step.day}</span>
                      <span className="text-base my-1">
                        {step.crate ? '🎁' : isCompleted ? '✅' : '🪙'}
                      </span>
                      <span className="text-[10px] font-semibold text-white/80 leading-tight">
                        {step.sc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Quests */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <span>🎯</span> Daily Missions
              </span>

              <div className="space-y-2">
                {dailyQuests.map((q) => {
                  const isDone = q.progress >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-white truncate">{q.desc}</p>
                          <span className="text-[11px] font-bold text-amber-400">
                            +{q.reward} SC
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : 'bg-violet-500'
                            }`}
                            style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-white/40">
                          <span>Progress</span>
                          <span>
                            {q.progress} / {q.target}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => claimQuest('daily', q.id)}
                        disabled={!isDone || q.claimed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          q.claimed
                            ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                            : isDone
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        {q.claimed ? 'Claimed' : isDone ? 'Claim' : 'In Progress'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Quests */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>🏆</span> Weekly Challenges
              </span>

              <div className="space-y-2">
                {weeklyQuests.map((q) => {
                  const isDone = q.progress >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-white truncate">{q.desc}</p>
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            +{q.reward} SC {q.rewardCrate && '· 🎁 Epic Crate'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-white/40">
                          <span>Progress</span>
                          <span>
                            {q.progress} / {q.target}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => claimQuest('weekly', q.id)}
                        disabled={!isDone || q.claimed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          q.claimed
                            ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                            : isDone
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        {q.claimed ? 'Claimed' : isDone ? 'Claim' : 'In Progress'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer status */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span>🪙</span> Balance: <strong className="text-white font-bold">{soulCoins} SC</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🎁</span> Unopened Crates: <strong className="text-white font-bold">{cratesCount}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
