/**
 * Navbar.jsx — Noir Tactical HUD Top Navigation
 * Monospace classified aesthetics, black obsidian canvas, sharp red reticles.
 */
import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
      <header className="w-full bg-black/95 border-b border-zinc-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.8)] shrink-0 z-40 relative font-mono">
        {/* Subtle Top Red Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-600/80 to-transparent pointer-events-none" />

        {/* Left: Call-sign & Avatar Card */}
        <div 
          onClick={() => openProfile('loadout')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group p-1 -m-1"
          role="button"
          tabIndex={0}
          title="Open Operative Dossier"
        >
          <div className="relative w-9 h-9 border border-zinc-700 bg-zinc-950 flex items-center justify-center p-0.5 group-hover:border-red-600 transition-colors">
            {/* Viewfinder Corners */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-red-600" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-red-600" />
            
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

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-zinc-100 tracking-wider group-hover:text-red-400 transition-colors">
              {profile?.username || 'UNKNOWN AGENT'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest">
                LVL {profile?.stats?.level || 1}
              </span>
              <span className="text-[8px] text-zinc-600 font-bold hidden sm:inline">
                // SEC-CLEARANCE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title Brand */}
        <div className="hidden md:flex flex-col items-center select-none pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
            <span className="text-sm font-black tracking-[0.25em] text-white">UNDERCOVER</span>
            <span className="w-1.5 h-1.5 bg-red-600 animate-pulse" />
          </div>
          <span className="text-[8px] text-zinc-500 tracking-[0.35em] uppercase font-semibold">
            TOP SECRET PROTOCOL
          </span>
        </div>

        {/* Right: Black Funds, Armory, Terminal 3-Dots */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {profile ? (
            <>
              {/* Black Funds Pill */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsShopOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 hover:border-red-600/70 px-2.5 py-1 transition-all cursor-pointer shadow-sm group"
                title={`${coinsBalance} Black Funds`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 group-hover:shadow-[0_0_8px_#dc2626] transition-shadow" />
                <span className="font-bold tracking-wider text-amber-400 text-xs tabular-nums">
                  {coinsBalance.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-500 font-bold hidden sm:inline">BF</span>
              </motion.button>

              {/* Armory Icon Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsShopOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950 hover:border-red-600 hover:text-red-400 text-zinc-300 transition-all cursor-pointer shadow-sm"
                title="Armory // Black Market"
              >
                <span className="text-xs">📦</span>
              </motion.button>

              {/* Terminal Flyout Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950 hover:border-red-600 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Operative Menu"
              >
                <span className="text-base leading-none">⋮</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsAuthOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white border border-red-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer"
            >
              AUTHORIZE
            </motion.button>
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
          onOpenAudio={() => {}}
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
