/**
 * Navbar.jsx — Top navigation bar.
 * Uses useTranslation() from react-i18next for all user-facing strings.
 * Synced with languageStore (RTL/LTR) via the LanguageToggle component.
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { LanguageToggle } from './ui/LanguageToggle';
import { DiscordIcon } from './DiscordIcon';
import AuthModal from './ui/AuthModal';

const ProfileModal = lazy(() => import('./ui/ProfileModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));

export default function Navbar() {
  const { t } = useTranslation();
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
      <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex justify-between items-center relative z-40 select-none">
        {/* Left: Brand + Discord + Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="font-black text-lg sm:text-xl bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1.5">
            <span className="text-xl">🕵️</span>
            <span>Undercover</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center">
            <LanguageToggle variant="chip" />
          </div>

          {/* Discord Community Link */}
          <a
            href="https://discord.gg/XgVSFcvNM5"
            target="_blank"
            rel="noopener noreferrer"
            title={t('header.discord')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#5865F2]/15 hover:bg-[#5865F2]/30 text-[#5865F2] border border-[#5865F2]/30 rounded-full transition cursor-pointer text-xs font-bold"
          >
            <DiscordIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Discord</span>
          </a>
        </div>

        {/* Right: User Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {profile ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 1. STREAK BADGE → Opens Profile Stats tab */}
              <button
                type="button"
                onClick={() => openProfile('stats')}
                title={`${t('header.streak')}: ${currentStreak}`}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl cursor-pointer transition active:scale-95 text-xs sm:text-sm font-bold text-orange-400 shadow-sm"
              >
                <span>🔥</span>
                <span>{currentStreak}</span>
              </button>

              {/* 2. COINS / SHOP BADGE → Opens Shop Modal */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                title={`${t('header.shop')}: ${coinsBalance} ${t('header.coins')}`}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl cursor-pointer transition active:scale-95 text-xs sm:text-sm font-bold text-amber-400 shadow-sm"
              >
                <span className="tabular-nums">{coinsBalance.toLocaleString()}</span>
                <span>🪙</span>
              </button>

              {/* 3. USERNAME / AVATAR BADGE → Opens Profile Modal */}
              <button
                type="button"
                onClick={() => openProfile('loadout')}
                title={`${profile.username || 'Guest01'} · ${t('header.profile')}`}
                className="flex items-center gap-1.5 sm:gap-2 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 hover:border-purple-500/50 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm cursor-pointer transition active:scale-95 shadow-sm group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">
                  {profile.avatar_url || '🎭'}
                </span>
                <span className="font-bold text-purple-100 max-w-[90px] sm:max-w-[140px] truncate">
                  {profile.username || 'Guest01'}
                </span>
                {isGuest && (
                  <span className="bg-amber-500/25 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                    {t('header.guest')}
                  </span>
                )}
              </button>

              {/* 4. LOGOUT BUTTON */}
              <button
                type="button"
                onClick={signOut}
                title={t('header.logout')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>{t('header.logout')}</span>
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
              <span>{t('auth.login')}</span>
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
