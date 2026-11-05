/**
 * SouLPassModal.jsx
 * 50-Tier Progression Season Pass with XP requirement level * 200 XP.
 * Milestone Tiers: Levels 10, 20, 30, 40, 50.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Gift, Check, Lock, Coins, Shield } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useLanguageStore } from '../../store/languageStore';
import { PASS_TIERS } from '../../data/economyCatalog';
import { toast } from '../../store/toastStore';

const spring = { type: 'spring', stiffness: 500, damping: 28 };

export default function SouLPassModal({ isOpen, onClose }) {
  const { isRTL, t } = useLanguageStore();
  const {
    seasonLevel,
    seasonXP,
    unlockedPassTiers,
    claimedPassTiers,
    claimPassTier,
    claimAllPassTiers,
    soulCoins,
  } = useEconomyStore();

  if (!isOpen) return null;

  const currentLevelRequiredXP = seasonLevel * 200;
  const progressPercent = Math.min(100, Math.round((seasonXP / currentLevelRequiredXP) * 100));
  const claimableCount = unlockedPassTiers.filter((lvl) => !claimedPassTiers.includes(lvl)).length;

  const handleClaimTier = (tier) => {
    const success = claimPassTier(tier.level);
    if (success) {
      if (tier.reward?.sc) {
        toast.coin(tier.reward.sc, `Tier ${tier.level} Pass reward`);
      } else {
        toast.success(`Tier ${tier.level} Claimed!`, tier.reward?.name || 'Pass Reward');
      }
    }
  };

  const handleClaimAll = () => {
    const claimedCount = claimAllPassTiers();
    if (claimedCount > 0) {
      toast.success(`Claimed All Tiers!`, `${claimedCount} Pass rewards collected`);
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
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-850 bg-zinc-900/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                    {t('pass.title') || 'Season Battle Pass'}
                    <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-900/60 px-2 py-0.5 rounded font-mono font-bold">
                      {t('pass.season') || 'Season 1'}
                    </span>
                  </h2>
                  <p className="text-zinc-400 text-xs font-mono">
                    {t('pass.subtitle') || '50 Tiers of Tactical Rewards · Progress with Match XP'}
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

            {/* Level & XP Progress Banner */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-mono font-black text-sm">
                  {seasonLevel}
                </div>
                <div>
                  <p className="text-white text-xs font-bold">
                    {t('pass.tierProgress', { level: seasonLevel }) || `Tier ${seasonLevel} of 50`}
                  </p>
                  <p className="text-zinc-400 text-[11px] font-mono">
                    {t('pass.xpRemaining', { xp: seasonXP, total: currentLevelRequiredXP }) || `${seasonXP} / ${currentLevelRequiredXP} XP to Next Tier`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 w-full max-w-xs mx-auto sm:mx-3">
                <div className="w-full h-2 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Claim All Button */}
              <button
                type="button"
                onClick={handleClaimAll}
                disabled={claimableCount === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                  claimableCount > 0
                    ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                    : 'bg-zinc-850 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                <Gift size={13} />
                <span>{t('pass.claimAll', { count: claimableCount }) || `Claim All (${claimableCount})`}</span>
              </button>
            </div>
          </div>

          {/* Tier Track list */}
          <div className="overflow-y-auto p-4 sm:p-5 space-y-2 flex-1">
            {PASS_TIERS.map((tier) => {
              const isUnlocked = unlockedPassTiers.includes(tier.level);
              const isClaimed = claimedPassTiers.includes(tier.level);
              const isCurrent = tier.level === seasonLevel;
              const isMilestone = tier.isMilestone;

              return (
                <div
                  key={tier.level}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isMilestone
                      ? 'bg-zinc-900/90 border-amber-600/40'
                      : isCurrent
                      ? 'bg-red-950/20 border-red-600/50'
                      : isUnlocked
                      ? 'bg-zinc-900/50 border-zinc-800'
                      : 'bg-zinc-950 border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isMilestone
                          ? 'bg-amber-400 text-black'
                          : isUnlocked
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tier.level}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tier.reward?.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                            {tier.reward?.name}
                            {isMilestone && (
                              <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 py-0.2 rounded font-mono font-bold uppercase">
                                {t('pass.milestone') || 'Milestone'}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {t('pass.requires', { xp: tier.xpRequired }) || `Requires ${tier.xpRequired} XP`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ms-2">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                        <Check size={11} strokeWidth={3} />
                        <span>{t('pass.claimed') || 'Claimed'}</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleClaimTier(tier)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {t('pass.claim') || 'Claim'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-zinc-500 text-xs font-mono">
                        <Lock size={12} />
                        <span>{t('pass.locked') || 'Locked'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Coins size={13} className="text-amber-400" />
              <span>{t('pass.balance') || 'Balance:'} <strong className="text-white font-bold">{soulCoins} {isRTL ? 'رصيد' : 'SC'}</strong></span>
            </span>
            <span className="text-zinc-500 text-[11px]">
              {t('pass.earnInfo') || 'Earn +100 XP per match (+50 XP bonus on win)'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
