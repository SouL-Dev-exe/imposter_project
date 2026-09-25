/**
 * Header.jsx — Responsive Single-Row Top Navigation Bar.
 * Fits all controls neatly on mobile (< 400px) & desktop without wrapping.
 * Heavy economy modals are lazy-loaded so they only download when first opened.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEconomyStore } from '../store/economyStore';
import { useAuthStore } from '../store/authStore';
import { LanguageToggle } from './ui/LanguageToggle';
import { DiscordIcon } from './DiscordIcon';
import UserAvatar from './ui/UserAvatar';
import { toast } from '../store/toastStore';

// ─── Lazy-loaded heavy modal chunks ────────────────────────────────────────
const SouLStoreModal   = lazy(() => import('./economy/SouLStoreModal'));
const SouLPassModal    = lazy(() => import('./economy/SouLPassModal'));
const CrateOpeningModal = lazy(() => import('./economy/CrateOpeningModal'));
const DailyQuestsModal = lazy(() => import('./economy/DailyQuestsModal'));
const LeaderboardModal = lazy(() => import('./economy/LeaderboardModal'));
const ProfileModal     = lazy(() => import('./ui/ProfileModal'));

// Lightweight spinner shown while a modal chunk loads
function ModalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
    </div>
  );
}

export function Header({
  showBack = false,
  backTo = '/',
  title = '',
  subtitle = '',
  className = '',
}) {
  const navigate = useNavigate();

  const [isStoreOpen,       setIsStoreOpen]       = useState(false);
  const [isPassOpen,        setIsPassOpen]         = useState(false);
  const [isCratesOpen,      setIsCratesOpen]       = useState(false);
  const [isQuestsOpen,      setIsQuestsOpen]       = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen]  = useState(false);
  const [isSettingsOpen,    setIsSettingsOpen]     = useState(false);
  const [isProfileOpen,     setIsProfileOpen]      = useState(false);

  const { profile } = useAuthStore();
  const username = profile?.username || 'Player';

  const {
    soulCoins,
    streakDays,
    dailyQuests,
    weeklyQuests,
    streakRewardPending,
    clearStreakNotification,
    equippedAvatarStyle,
    equipped,
  } = useEconomyStore();

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
      <header
        className={`flex items-center justify-between w-full px-3 py-2 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 ${className}`}
        aria-label="Main Navigation"
      >
        {/* Left Control Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {showBack && (
            <button
              onClick={() => navigate(backTo)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-white transition-colors cursor-pointer text-base leading-none shrink-0"
              aria-label="Go back"
              title="Go Back"
            >
              ←
            </button>
          )}

          {/* ⚙️ Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-white transition-colors cursor-pointer shrink-0 text-sm"
          >
            ⚙️
          </button>

          {/* 🏆 Leaderboard */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            title="Global Leaderboard"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-white transition-colors cursor-pointer shrink-0 text-sm"
          >
            🏆
          </button>

          {/* 🛒 Store */}
          <button
            onClick={() => setIsStoreOpen(true)}
            title="SouL Store"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-white transition-colors cursor-pointer shrink-0 text-sm"
          >
            🛒
          </button>

          {/* 🔥 Streak Badge */}
          <button
            onClick={() => setIsQuestsOpen(true)}
            title="Daily Streak & Quests"
            className="relative px-2 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-amber-500/20 transition-colors shrink-0"
          >
            <span>🔥</span>
            <span>{streakDays || 1}</span>
            {claimableQuestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Language Toggle & Discord (desktop) */}
          <div className="hidden md:flex items-center gap-1.5 ms-1">
            <LanguageToggle variant="chip" />
            <a
              href="https://discord.gg/XgVSFcvNM5"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord Server"
              title="Join our Discord Server"
              className="p-1.5 bg-black/40 hover:bg-[#5865F2]/20 border border-white/10 rounded-full text-white/70 hover:text-[#5865F2] transition-colors"
            >
              <DiscordIcon className="w-4 h-4" />
            </a>
          </div>

          {title && (
            <div className="hidden sm:block ms-1">
              <h1 className="text-sm font-bold text-white leading-tight">{title}</h1>
              {subtitle && <p className="text-white/40 text-[10px]">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right Control Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 🪙 Coins Pill */}
          <button
            onClick={() => setIsStoreOpen(true)}
            title="SouL Coins Balance · Click to open Store"
            className="text-xs py-1 px-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/20 transition-colors"
          >
            <span className="tabular-nums">{soulCoins.toLocaleString()}</span>
            <span className="text-sm">🪙</span>
          </button>

          {/* Dynamic User Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            title={`${username} · Profile & Locker`}
            className="flex items-center gap-1 focus:outline-none cursor-pointer group"
          >
            <UserAvatar
              username={username}
              avatarStyle={equippedAvatarStyle}
              equipped={equipped}
              size="sm"
              className="group-hover:scale-105 transition-transform"
            />
          </button>
        </div>
      </header>

      {/* ─── Lazy-loaded Modals ─────────────────────────────────────────── */}
      <Suspense fallback={<ModalLoader />}>
        {isStoreOpen       && <SouLStoreModal    isOpen={isStoreOpen}       onClose={() => setIsStoreOpen(false)} />}
        {isPassOpen        && <SouLPassModal      isOpen={isPassOpen}        onClose={() => setIsPassOpen(false)} />}
        {isCratesOpen      && <CrateOpeningModal  isOpen={isCratesOpen}      onClose={() => setIsCratesOpen(false)} />}
        {isQuestsOpen      && <DailyQuestsModal   isOpen={isQuestsOpen}      onClose={() => setIsQuestsOpen(false)} />}
        {isLeaderboardOpen && <LeaderboardModal   isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />}
        {isSettingsOpen    && <ProfileModal       isOpen={isSettingsOpen}    onClose={() => setIsSettingsOpen(false)} defaultTab="settings" />}
        {isProfileOpen     && <ProfileModal       isOpen={isProfileOpen}     onClose={() => setIsProfileOpen(false)} defaultTab="loadout" />}
      </Suspense>

      {/* Daily Streak Toast Banner */}
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
              className="ms-2 px-2.5 py-1 bg-black/30 hover:bg-black/50 rounded-lg text-white text-[11px] transition-colors cursor-pointer"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { Header as Navbar };
export default Header;
