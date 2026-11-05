/**
 * EconomyHeaderBadge.jsx
 * Persistent header bar badge displaying SouL Coins balance, Season Level & Economic Tier.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Package, Gift, Flame, Trophy, Shield, User } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useAuthStore } from '../../store/authStore';
import { getEconomicRank } from '../../data/economyCatalog';
import UserAvatar from '../ui/UserAvatar';
import SouLStoreModal from './SouLStoreModal';
import SouLPassModal from './SouLPassModal';
import CrateOpeningModal from './CrateOpeningModal';
import DailyQuestsModal from './DailyQuestsModal';
import LeaderboardModal from './LeaderboardModal';
import ProfileModal from '../ui/ProfileModal';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

export default function EconomyHeaderBadge({ className = '' }) {
  const [storeOpen, setStoreOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [cratesOpen, setCratesOpen] = useState(false);
  const [questsOpen, setQuestsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { profile } = useAuthStore();
  const username = profile?.username || 'Operative';

  const {
    soulCoins,
    seasonLevel,
    totalCoinsEarned,
    cratesCount,
    unlockedPassTiers,
    claimedPassTiers,
    dailyQuests,
    weeklyQuests,
    equippedAvatarStyle,
    equipped,
  } = useEconomyStore();

  const rank = getEconomicRank(totalCoinsEarned);

  const unclaimedPassCount = unlockedPassTiers.filter((lvl) => !claimedPassTiers.includes(lvl)).length;
  const claimableQuestsCount =
    dailyQuests.filter((q) => q.progress >= q.target && !q.claimed).length +
    weeklyQuests.filter((q) => q.progress >= q.target && !q.claimed).length;

  return (
    <>
      <div className={`flex items-center gap-1.5 sm:gap-2 text-xs select-none font-sans ${className}`}>
        {/* 1. Avatar shortcut */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => setSettingsOpen(true)}
          title={`${username} · Settings & Profile`}
          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg p-1 pe-2 text-white font-semibold transition-colors cursor-pointer"
        >
          <UserAvatar
            username={username}
            avatarStyle={equippedAvatarStyle}
            equipped={equipped}
            size="xs"
          />
          <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">{username}</span>
        </motion.button>

        {/* 2. Coins Counter */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => setStoreOpen(true)}
          title="Credits · Open Armory"
          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-2.5 py-1 text-amber-400 font-mono font-bold transition-colors cursor-pointer"
        >
          <Coins size={13} className="text-amber-400" />
          <span className="tabular-nums">{soulCoins.toLocaleString()}</span>
        </motion.button>

        {/* 3. Store Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={() => setStoreOpen(true)}
          title="Store"
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <Package size={14} />
          <span className="hidden md:inline font-semibold text-xs">Store</span>
        </motion.button>

        {/* 4. Season Level */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => setPassOpen(true)}
          title={`Level ${seasonLevel} (${rank.name}) · Battle Pass`}
          className="relative hidden sm:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 font-mono font-bold transition-colors cursor-pointer"
        >
          <Shield size={12} className="text-red-500" />
          <span className="text-[11px] text-zinc-300">Lvl {seasonLevel}</span>

          {unclaimedPassCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unclaimedPassCount}
            </span>
          )}
        </motion.button>

        {/* 5. Crates */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={() => setCratesOpen(true)}
          title="Mystery Crates"
          className="relative p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <Gift size={14} />
          {cratesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {cratesCount}
            </span>
          )}
        </motion.button>

        {/* 6. Daily Quests */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={() => setQuestsOpen(true)}
          title="Daily Quests"
          className="relative p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <Flame size={14} />
          {claimableQuestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {claimableQuestsCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Modals */}
      <SouLStoreModal isOpen={storeOpen} onClose={() => setStoreOpen(false)} />
      <SouLPassModal isOpen={passOpen} onClose={() => setPassOpen(false)} />
      <CrateOpeningModal isOpen={cratesOpen} onClose={() => setCratesOpen(false)} />
      <DailyQuestsModal isOpen={questsOpen} onClose={() => setQuestsOpen(false)} />
      <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <ProfileModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} defaultTab="settings" />
    </>
  );
}
