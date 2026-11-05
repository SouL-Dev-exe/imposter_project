/**
 * DailyQuestsModal.jsx
 * Displays the 7-day Daily Login Streak ladder and Daily/Weekly quests.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, Target, Trophy, X, Gift, Check, Coins } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useLanguageStore } from '../../store/languageStore';
import { STREAK_LADDER } from '../../data/economyCatalog';
import { toast } from '../../store/toastStore';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

export default function DailyQuestsModal({ isOpen, onClose }) {
  const { isRTL, t } = useLanguageStore();
  const {
    streakDays,
    dailyQuests,
    weeklyQuests,
    claimQuest,
    soulCoins,
    cratesCount,
  } = useEconomyStore();

  if (!isOpen) return null;

  const handleClaim = (type, q) => {
    const success = claimQuest(type, q.id);
    if (success) {
      toast.quest(q.desc, q.reward);
      if (q.rewardCrate) {
        toast.success(`Bonus Reward!`, `Unlocked 1 Mystery Crate`);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={spring}
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-850 bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Flame size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {t('quests.title') || 'Daily Streak & Missions'}
                </h2>
                <p className="text-zinc-400 text-xs font-mono">
                  {t('quests.subtitle', { days: streakDays }) || `${streakDays} Day Active Streak · Daily Credits & Crates`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
            {/* 7-Day Login Streak Ladder */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase font-mono">
                  <Calendar size={13} className="text-amber-400" />
                  {t('quests.streakLadder') || '7-Day Streak Ladder'}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {t('quests.day', { n: streakDays }) || `Day ${streakDays}`}
                </span>
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
                          ? 'bg-amber-950/20 border-amber-500/60 text-amber-300'
                          : isCompleted
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold">
                        {isRTL ? `ي${step.day}` : `D${step.day}`}
                      </span>
                      <div className="my-1">
                        {step.crate ? (
                          <Gift size={16} className="text-amber-400" />
                        ) : isCompleted ? (
                          <Check size={16} className="text-emerald-400" />
                        ) : (
                          <Coins size={16} className="text-zinc-500" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold leading-tight">
                        {step.sc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Quests */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase font-mono">
                <Target size={13} className="text-red-500" />
                {t('quests.daily') || 'Daily Operations'}
              </span>

              <div className="space-y-2">
                {dailyQuests.map((q) => {
                  const isDone = q.progress >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{q.desc}</p>
                          <span className="text-[11px] font-mono font-bold text-amber-400">
                            +{q.reward} {isRTL ? 'رصيد' : 'SC'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-500 font-mono">
                          <span>{t('quests.progress') || 'Progress'}</span>
                          <span>
                            {q.progress} / {q.target}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaim('daily', q)}
                        disabled={!isDone || q.claimed}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                          q.claimed
                            ? 'bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800'
                            : isDone
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            : 'bg-zinc-850 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {q.claimed ? (t('quests.claimed') || 'Claimed') : isDone ? (t('quests.claim') || 'Claim') : (t('quests.active') || 'Active')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Quests */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 uppercase font-mono">
                <Trophy size={13} className="text-amber-400" />
                {t('quests.weekly') || 'Weekly Directives'}
              </span>

              <div className="space-y-2">
                {weeklyQuests.map((q) => {
                  const isDone = q.progress >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{q.desc}</p>
                          <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                            +{q.reward} {isRTL ? 'رصيد' : 'SC'} {q.rewardCrate && (t('quests.crateBonus') || '· 1 Crate')}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-500 font-mono">
                          <span>{t('quests.progress') || 'Progress'}</span>
                          <span>
                            {q.progress} / {q.target}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaim('weekly', q)}
                        disabled={!isDone || q.claimed}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                          q.claimed
                            ? 'bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800'
                            : isDone
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            : 'bg-zinc-850 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {q.claimed ? (t('quests.claimed') || 'Claimed') : isDone ? (t('quests.claim') || 'Claim') : (t('quests.active') || 'Active')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
