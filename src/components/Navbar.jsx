/**
 * Navbar.jsx — Premium Clean Dark Mode Header
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import AuthModal from './ui/AuthModal';

const OperativeMenuModal = lazy(() => import('./OperativeMenuModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));
const ProfileModal = lazy(() => import('./ui/ProfileModal'));

export default function Navbar() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { soulCoins } = useEconomyStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileDefaultTab, setProfileDefaultTab] = useState('loadout');

  const coinsBalance = profile?.soul_coins ?? soulCoins ?? 500;

  const openProfile = (tab = 'loadout') => {
    setProfileDefaultTab(tab);
    setIsProfileOpen(true);
  };

  return (
    <>
      <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-40 rounded-t-2xl sm:rounded-t-none">
        
        {/* LEFT: Clean Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="text-lg leading-none pb-0.5">🕵️</span>
          </div>
          <div className="font-sans text-sm font-semibold tracking-tight text-white truncate leading-tight">
            <span>Undercover</span>
          </div>
        </div>

        {/* RIGHT: Credits, Armory, and 3-Dots */}
        <div className="flex items-center gap-3 shrink-0">
          {profile ? (
            <>
              {/* Balance / Credits Pill */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
                title={`${coinsBalance} Credits`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{coinsBalance.toLocaleString()}</span>
              </button>

              {/* Quick-access Armory */}
              <button
                onClick={() => setIsShopOpen(true)}
                className="hidden sm:flex bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white transition-all"
              >
                Store
              </button>

              {/* 3-Dots Menu Trigger */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-none px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <Suspense fallback={null}>
        <OperativeMenuModal
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenProfile={() => openProfile('loadout')}
          onOpenStats={() => openProfile('stats')}
          onOpenAudio={() => { /* TODO */ }}
        />
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
