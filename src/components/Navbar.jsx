import { useState, lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import AuthModal from './ui/AuthModal';

const ProfileModal = lazy(() => import('./ui/ProfileModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));

export default function Navbar() {
  const { profile, isGuest, signOut } = useAuthStore();
  const { streakDays, soulCoins } = useEconomyStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [profileDefaultTab, setProfileDefaultTab] = useState('loadout');

  const coinsBalance = profile?.soul_coins ?? soulCoins ?? 500;
  const currentStreak = profile?.stats?.win_streak || profile?.stats?.streak_days || streakDays || 1;

  const openProfile = (tab = 'loadout') => {
    setProfileDefaultTab(tab);
    setIsProfileOpen(true);
  };

  return (
    <>
      <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-3 flex justify-between items-center relative z-40 select-none">
        {/* Left: Game Brand / Title */}
        <div className="font-black text-lg sm:text-xl bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="text-xl">🕵️</span>
          <span>Undercover</span>
        </div>

        {/* Right: User Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {profile ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 1. STREAK BADGE (Clickable -> Opens Profile Stats) */}
              <button
                type="button"
                onClick={() => openProfile('stats')}
                title={`Streak: ${currentStreak} days · Click to view stats`}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl cursor-pointer transition active:scale-95 text-xs sm:text-sm font-bold text-orange-400 shadow-sm"
              >
                <span>🔥</span>
                <span>{currentStreak}</span>
              </button>

              {/* 2. COINS / SHOP BADGE (Clickable -> Opens Shop Modal) */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                title={`SouL Coins: ${coinsBalance} · Click to open Shop`}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl cursor-pointer transition active:scale-95 text-xs sm:text-sm font-bold text-amber-400 shadow-sm"
              >
                <span className="tabular-nums">{coinsBalance.toLocaleString()}</span>
                <span>🪙</span>
              </button>

              {/* 3. USERNAME / AVATAR BADGE (Clickable -> Opens Profile Modal) */}
              <button
                type="button"
                onClick={() => openProfile('loadout')}
                title={`${profile.username || 'Player'} · Click to view Profile & Locker`}
                className="flex items-center gap-1.5 sm:gap-2 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 hover:border-purple-500/50 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm cursor-pointer transition active:scale-95 shadow-sm group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">
                  {profile.avatar_url || '🎭'}
                </span>
                <span className="font-bold text-purple-100 max-w-[90px] sm:max-w-[140px] truncate">
                  {profile.username || 'Player'}
                </span>
                {isGuest && (
                  <span className="bg-amber-500/25 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                    زائر
                  </span>
                )}
              </button>

              {/* 4. LOGOUT BUTTON */}
              <button
                type="button"
                onClick={signOut}
                title="تسجيل الخروج من الحساب"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>خروج</span>
                <span className="hidden md:inline text-red-400/60 text-xs">(Logout)</span>
              </button>
            </div>
          ) : (
            /* Login Button if Logged Out */
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-purple-600/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🔐</span>
              <span>تسجيل الدخول (Login)</span>
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Lazy Modals */}
      <Suspense fallback={null}>
        {isProfileOpen && (
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            defaultTab={profileDefaultTab}
          />
        )}
        {isShopOpen && (
          <SouLStoreModal
            isOpen={isShopOpen}
            onClose={() => setIsShopOpen(false)}
          />
        )}
      </Suspense>
    </>
  );
}

export { Navbar };
