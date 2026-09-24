/**
 * SouLPassModal.jsx
 * 50-Tier Progression Season Pass with XP requirement level * 200 XP.
 * Milestone Tiers: Levels 10, 20, 30, 40, 50.
 * Includes interactive progress bar, claim individual tiers, and "Claim All" button.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { PASS_TIERS } from '../../data/economyCatalog';
import { toast } from '../../store/toastStore';

export default function SouLPassModal({ isOpen, onClose }) {
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
        toast.coin(tier.reward.sc, `Tier ${tier.level} SouL Pass reward`);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-violet-950/60 via-gray-900 to-purple-950/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-2xl shadow-lg shadow-violet-600/20">
                  ⭐
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    SouL Pass <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold">Season 1</span>
                  </h2>
                  <p className="text-white/40 text-xs">
                    50 Tiers of Free Rewards · Level Up with Match XP
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

            {/* Level & XP Progress Banner */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                  {seasonLevel}
                </div>
                <div>
                  <p className="text-white text-xs font-bold">Tier {seasonLevel} of 50</p>
                  <p className="text-white/40 text-[11px]">
                    {seasonXP} / {currentLevelRequiredXP} XP to Tier {Math.min(50, seasonLevel + 1)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 w-full max-w-xs mx-auto sm:mx-4">
                <div className="w-full h-2.5 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Claim All Button */}
              <button
                onClick={handleClaimAll}
                disabled={claimableCount === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  claimableCount > 0
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                }`}
              >
                <span>🎁</span> Claim All ({claimableCount})
              </button>
            </div>
          </div>

          {/* Tier Track list */}
          <div className="overflow-y-auto p-5 space-y-2.5 flex-1">
            {PASS_TIERS.map((tier) => {
              const isUnlocked = unlockedPassTiers.includes(tier.level);
              const isClaimed = claimedPassTiers.includes(tier.level);
              const isCurrent = tier.level === seasonLevel;
              const isMilestone = tier.isMilestone;

              return (
                <div
                  key={tier.level}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isMilestone
                      ? 'bg-gradient-to-r from-purple-950/40 via-violet-900/20 to-gray-900 border-amber-500/40 shadow-lg shadow-purple-950/30'
                      : isCurrent
                      ? 'bg-violet-600/10 border-violet-500/40'
                      : isUnlocked
                      ? 'bg-white/5 border-white/10'
                      : 'bg-black/20 border-white/5 opacity-70'
                  }`}
                >
                  {/* Left: Level badge & Milestone badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isMilestone
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                          : isUnlocked
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {tier.level}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tier.reward?.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {tier.reward?.name}
                            {isMilestone && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                Milestone
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-white/40">
                            Requires {tier.xpRequired} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Claim Action */}
                  <div className="shrink-0 ms-2">
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <span>✓</span> Claimed
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleClaimTier(tier)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-white/30 text-xs font-medium">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span>🪙</span> SouL Coins: <strong className="text-white font-bold">{soulCoins} SC</strong>
            </span>
            <span className="text-white/40 text-[11px]">
              Play matches to earn +100 XP (+50 XP bonus on win)
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
