/**
 * EconomyHeaderBadge.jsx
 * Persistent header bar badge displaying SouL Coins balance, Season Level & Economic Tier.
 * Provides quick launcher buttons for Store, Pass, Crates, and Quests with interactive modals.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { getEconomicRank } from '../../data/economyCatalog';
import SouLStoreModal from './SouLStoreModal';
import SouLPassModal from './SouLPassModal';
import CrateOpeningModal from './CrateOpeningModal';
import DailyQuestsModal from './DailyQuestsModal';
import LeaderboardModal from './LeaderboardModal';
import { toast } from '../../store/toastStore';

export default function EconomyHeaderBadge({ className = '' }) {
  const [storeOpen, setStoreOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [cratesOpen, setCratesOpen] = useState(false);
  const [questsOpen, setQuestsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const {
    soulCoins,
    seasonLevel,
    totalCoinsEarned,
    cratesCount,
    unlockedPassTiers,
    claimedPassTiers,
    dailyQuests,
    weeklyQuests,
    streakRewardPending,
    clearStreakNotification,
  } = useEconomyStore();

  const rank = getEconomicRank(totalCoinsEarned);

  // Notification badges
  const unclaimedPassCount = unlockedPassTiers.filter((lvl) => !claimedPassTiers.includes(lvl)).length;
  const claimableQuestsCount =
    dailyQuests.filter((q) => q.progress >= q.target && !q.claimed).length +
    weeklyQuests.filter((q) => q.progress >= q.target && !q.claimed).length;

  useEffect(() => {
    if (streakRewardPending) {
      toast.streak(streakRewardPending.day, `${streakRewardPending.label} (+${streakRewardPending.sc} SC)`);
    }
  }, [streakRewardPending]);

  return (
    <>
      <div className={`flex items-center gap-1.5 sm:gap-2 text-xs select-none ${className}`}>
        {/* 1. SouL Coins Pill (Click opens Store) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStoreOpen(true)}
          title="SouL Coins · Click to open Store"
          className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/60 rounded-full px-2.5 sm:px-3 py-1 text-amber-400 font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="text-sm">🪙</span>
          <span className="tabular-nums">{soulCoins.toLocaleString()}</span>
        </motion.button>

        {/* 2. Season Level & Rank Badge (Click opens Pass) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPassOpen(true)}
          title={`Level ${seasonLevel} (${rank.name}) · Click to open SouL Pass`}
          className="relative flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-violet-500/30 hover:border-violet-500/60 rounded-full px-2.5 sm:px-3 py-1 text-white font-bold transition-all shadow-sm cursor-pointer"
        >
          <span className="text-xs">{rank.icon}</span>
          <span className="text-[11px] font-black text-violet-300">Lvl {seasonLevel}</span>

          {unclaimedPassCount > 0 && (
            <span className="absolute -top-1 -end-1 w-4 h-4 bg-amber-400 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow">
              {unclaimedPassCount}
            </span>
          )}
        </motion.button>

        {/* 3. Quick Action: Mystery Crate Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setCratesOpen(true)}
          title="Open Mystery Crates"
          className="relative p-1.5 sm:px-2 rounded-full bg-black/40 hover:bg-[#a855f7]/20 border border-white/10 hover:border-[#a855f7]/40 text-white/80 hover:text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          <span className="text-sm">🎁</span>
          {cratesCount > 0 && (
            <span className="absolute -top-1 -end-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow">
              {cratesCount}
            </span>
          )}
        </motion.button>

        {/* 4. Quick Action: Daily Quests / Streak */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setQuestsOpen(true)}
          title="Daily Streak & Quests"
          className="relative p-1.5 sm:px-2 rounded-full bg-black/40 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-white/80 hover:text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          <span className="text-sm">🔥</span>
          {claimableQuestsCount > 0 && (
            <span className="absolute -top-1 -end-1 w-4 h-4 bg-emerald-400 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow">
              {claimableQuestsCount}
            </span>
          )}
        </motion.button>

        {/* 5. Global Leaderboard */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setLeaderboardOpen(true)}
          title="Global Leaderboard"
          className="p-1.5 sm:px-2 rounded-full bg-black/40 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/40 text-white/80 hover:text-white transition-all shadow-sm cursor-pointer flex items-center justify-center"
        >
          <span className="text-sm">🏆</span>
        </motion.button>
      </div>

      {/* Modals */}
      <SouLStoreModal isOpen={storeOpen} onClose={() => setStoreOpen(false)} />
      <SouLPassModal isOpen={passOpen} onClose={() => setPassOpen(false)} />
      <CrateOpeningModal isOpen={cratesOpen} onClose={() => setCratesOpen(false)} />
      <DailyQuestsModal isOpen={questsOpen} onClose={() => setQuestsOpen(false)} />
      <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />

      {/* Daily Streak Login Reward Toast */}
      {streakRewardPending && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-3 p-3.5 px-5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white font-bold rounded-2xl shadow-2xl border border-white/20 text-xs">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-black">Day {streakRewardPending.day} Streak Reward Claimed!</p>
              <p className="text-white/80 text-[11px] font-medium">{streakRewardPending.label}</p>
            </div>
            <button
              onClick={clearStreakNotification}
              className="ms-2 px-2.5 py-1 bg-black/30 hover:bg-black/50 rounded-lg text-white text-[11px] transition-colors"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
