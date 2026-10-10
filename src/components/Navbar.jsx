/**
 * Navbar.jsx — Minimalist Header Bar for Spy Noir Lobby
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
      <header className="w-full bg-zinc-950/90 border-b border-red-900/40 px-3 py-2 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(185,28,28,0.15)] sticky top-0 backdrop-blur-md font-mono select-none z-40">
        
        {/* LEFT: Compact Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative p-1 border border-red-600/40 bg-red-950/20">
            <span className="text-sm block">🕵️</span>
            <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-t border-l border-red-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-b border-r border-red-500" />
          </div>
          <div className="font-mono text-[10px] sm:text-xs font-black tracking-widest truncate leading-tight uppercase">
            <span className="text-red-500 block sm:inline">CLASSIFIED</span>
            <span className="text-zinc-500 font-normal sm:ml-1 hidden sm:inline">// UNDERCOVER</span>
          </div>
        </div>

        {/* RIGHT: Credits, Armory, and 3-Dots */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {profile ? (
            <>
              {/* Black Funds Balance Pill */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="flex items-center gap-1.5 bg-[#050507] border border-[#f59e0b]/40 hover:border-[#f59e0b] px-2.5 py-1 text-xs transition-colors cursor-pointer rounded-sm"
                title={`${coinsBalance} Credits`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                <span className="font-bold tracking-wider text-[#f59e0b]">
                  {coinsBalance.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#f59e0b]/70 hidden xs:inline">CREDITS</span>
              </button>

              {/* Quick-access Armory */}
              <button
                onClick={() => setIsShopOpen(true)}
                className="hidden sm:flex bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/40 hover:border-[#dc2626] hover:bg-[#dc2626]/20 px-3 py-1 text-xs font-bold tracking-widest uppercase transition-all"
              >
                ARMORY
              </button>

              {/* 3-Dots Menu Trigger */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-red-900/50 hover:border-red-600 bg-zinc-900 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
              >
                <span className="text-lg pb-1">⋮</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-red-950/90 hover:bg-red-600 hover:text-black text-red-200 border border-red-700/70 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition shadow-[0_0_15px_rgba(185,28,28,0.2)] active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>🔐</span>
              <span>AUTHORIZE</span>
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
          onOpenAudio={() => { /* TODO: Add audio modal trigger if exists */ }}
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
export { Navbar };

