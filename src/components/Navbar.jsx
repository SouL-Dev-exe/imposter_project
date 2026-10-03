/**
 * Navbar.jsx — Responsive Top Navigation Bar with Compact Badges.
 * Avoids mobile overflow by housing detailed actions (like Logout & Loadout) inside ProfileModal.
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { LanguageToggle } from './ui/LanguageToggle';
import AuthModal from './ui/AuthModal';

const ProfileModal = lazy(() => import('./ui/ProfileModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));

const formatCoins = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
};

export default function Navbar() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuthStore();
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
      <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 px-3 py-2.5 flex items-center justify-between z-40 sticky top-0 select-none">
        {/* Left: App Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl">🎩</span>
          <span className="font-extrabold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400">
            Undercover
          </span>
        </div>

        {/* Right: Compact Badges + Profile Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle Button */}
          <LanguageToggle variant="chip" />

          {profile ? (
            <>
              {/* Streak Count */}
              <button
                type="button"
                onClick={() => openProfile('stats')}
                title={`${t('header.streak')}: ${currentStreak}`}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer active:scale-95"
              >
                <span>🔥</span>
                <span>{currentStreak}</span>
              </button>

              {/* Coin Balance (opens Shop Modal) */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                title={`${t('header.shop')}: ${coinsBalance} ${t('header.coins')}`}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold transition cursor-pointer active:scale-95"
              >
                <span>🪙</span>
                <span className="tabular-nums">{formatCoins(coinsBalance)}</span>
              </button>

              {/* Profile Avatar Button */}
              <button
                type="button"
                onClick={() => openProfile('loadout')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer shrink-0"
                title={`${profile.username || 'Player'} · ${t('header.profile')}`}
              >
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs overflow-hidden">
                  {profile.avatar_url ? (
                    <span className="text-sm">{profile.avatar_url}</span>
                  ) : (
                    <span>👤</span>
                  )}
                </div>
              </button>
            </>
          ) : (
            /* Login Button if Logged Out */
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-purple-600/25 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>🔐</span>
              <span>{t('auth.login')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Lazy Modals */}
      <Suspense fallback={null}>
        {isProfileOpen && (
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            defaultTab={profileDefaultTab}
            onLogout={signOut}
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
