/**
 * Navbar.jsx — Noir Tactical HUD Header
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import AuthModal from './ui/AuthModal';
import { UserAvatar } from './ui/UserAvatar';

const OperativeMenuModal = lazy(() => import('./OperativeMenuModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));
const ProfileModal = lazy(() => import('./ui/ProfileModal'));

export default function Navbar() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { soulCoins, equippedAvatarStyle, equipped } = useEconomyStore();

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
      <header className="w-full bg-[#111116] border-b border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 z-40 relative">
        
        {/* Left: Call-sign & Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9 border border-zinc-700 bg-zinc-950 flex items-center justify-center p-0.5">
            {/* Square Viewfinder */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-rose-600" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-rose-600" />
            
            {profile ? (
              <UserAvatar
                username={profile?.username}
                avatarStyle={equippedAvatarStyle}
                equipped={equipped}
                size="xs"
              />
            ) : (
              <span className="text-sm">🕵️</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-200 tracking-wider">
              {profile?.username || 'UNKNOWN AGENT'}
            </span>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">
              LVL {profile?.stats?.level || 1}
            </span>
          </div>
        </div>

        {/* Center: Title (Hidden on small screens) */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-sm font-black tracking-[0.2em] text-white">UNDERCOVER</span>
          <span className="text-[8px] text-zinc-500 tracking-[0.3em] uppercase">DECEPTIVE INTEL</span>
        </div>

        {/* Right: Funds, Armory, 3-Dots */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {profile ? (
            <>
              {/* Black Funds Pill */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-950 border border-amber-600/30 px-2 py-1 hover:border-amber-500 transition-colors cursor-pointer"
                title={`${coinsBalance} Credits`}
              >
                <span className="w-1.5 h-1.5 bg-rose-600 animate-pulse" />
                <span className="font-bold tracking-wider text-amber-500 text-xs">
                  {coinsBalance.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-500 hidden sm:inline">BF</span>
              </button>

              {/* Armory Icon */}
              <button
                onClick={() => setIsShopOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900/80 hover:border-rose-600 hover:text-rose-400 text-zinc-300 transition-all"
              >
                <span className="text-sm">📦</span>
              </button>

              {/* Terminal Button 3-Dots */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-900/80 hover:border-rose-600 text-zinc-300 transition-all"
              >
                <span className="text-lg pb-1 leading-none">⋮</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-rose-700 hover:bg-rose-600 text-white border border-rose-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              AUTHORIZE
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
