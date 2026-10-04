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
import SpyHeaderProfile from './ui/SpyHeaderProfile';

const ProfileModal = lazy(() => import('./ui/ProfileModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));

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
      <header className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-red-900/40 px-3 sm:px-4 py-2 flex items-center justify-between z-40 sticky top-0 select-none font-mono">
        {/* Left: App Tactical Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-red-950/60 border border-red-600/70 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(220,38,38,0.35)] relative">
            <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-red-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-red-500" />
            <span>🕵️‍♂️</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-red-500">
              CLASSIFIED // UNDERCOVER
            </span>
            <span className="text-[9px] text-zinc-500 tracking-widest uppercase hidden sm:inline">
              SURVEILLANCE PROTOCOL
            </span>
          </div>
        </div>

        {/* Right: Language Toggle & Operative Header Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle variant="chip" />

          {profile ? (
            <SpyHeaderProfile
              profile={{ ...profile, soul_coins: coinsBalance }}
              onOpenStore={() => setIsShopOpen(true)}
              onOpenProfile={() => openProfile('loadout')}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-red-950/90 hover:bg-red-600 hover:text-black text-red-200 border border-red-700/70 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition shadow-[0_0_15px_rgba(185,28,28,0.2)] active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🔐</span>
              <span>AUTHORIZE AGENT</span>
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

