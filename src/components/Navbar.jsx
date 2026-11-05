/**
 * Navbar.jsx — Premium game navigation bar
 * No emoji, no glow, Lucide icons, clean Inter font.
 */
import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Package, MoreVertical, User, LogIn, Coins } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { useLanguageStore } from '../store/languageStore';
import spyRoleLogo from './assets/SpyRole_ favicon.png';
import AuthModal from './ui/AuthModal';
import { UserAvatar } from './ui/UserAvatar';
import LanguageToggle from './ui/LanguageToggle';

const OperativeMenuModal = lazy(() => import('./OperativeMenuModal'));
const SouLStoreModal = lazy(() => import('./economy/SouLStoreModal'));
const ProfileModal = lazy(() => import('./ui/ProfileModal'));

const spring = { type: 'spring', stiffness: 500, damping: 30 };

export default function Navbar() {
  const { profile } = useAuthStore();
  const { soulCoins, equippedAvatarStyle, equipped } = useEconomyStore();
  const { t, isRTL } = useLanguageStore();

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
      <header className="w-full bg-zinc-950 border-b border-zinc-900 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-40 relative font-sans">

        {/* Left: Avatar + user info */}
        <button
          onClick={() => openProfile('loadout')}
          className="flex items-center gap-2.5 shrink-0 group outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg p-1 -m-1"
          title={t('header.profile')}
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors bg-zinc-900 flex items-center justify-center shrink-0">
            {profile ? (
              <UserAvatar
                username={profile?.username}
                avatarStyle={equippedAvatarStyle}
                equipped={equipped}
                size="xs"
              />
            ) : (
              <User size={16} className="text-zinc-500" />
            )}
          </div>

          <div className="flex flex-col items-start text-start">
            <span className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors leading-tight">
              {profile?.username || t('header.guest')}
            </span>
            <span className="text-[10px] text-zinc-500 leading-tight font-mono">
              {t('profile.level')} {profile?.stats?.level || 1}
            </span>
          </div>
        </button>

        {/* Center: Brand */}
        <div className="flex absolute left-1/2 -translate-x-1/2 items-center gap-2 select-none pointer-events-none">
          <img
            src={spyRoleLogo}
            alt="SpyRole"
            className="h-7 w-7 rounded-md object-contain border border-zinc-800 shadow-[0_0_12px_rgba(220,38,38,0.35)] shrink-0"
          />
          <div className="hidden sm:flex items-center gap-1 font-mono tracking-wider">
            <span className="text-sm font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
              SPY<span className="text-red-600">ROLE</span>
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Universal Language Switcher */}
          <LanguageToggle variant="chip" />

          {profile ? (
            <>
              {/* Coin balance */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={() => setIsShopOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                title={`${coinsBalance.toLocaleString()} ${t('header.coins')}`}
              >
                <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span className="font-mono font-semibold text-amber-400 text-xs tabular-nums">
                  {coinsBalance.toLocaleString()}
                </span>
              </motion.button>

              {/* Store */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                onClick={() => setIsShopOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title={t('header.shop')}
              >
                <Package size={15} />
              </motion.button>

              {/* Menu */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                onClick={() => setIsMenuOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title={t('header.menu')}
              >
                <MoreVertical size={15} />
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn size={14} />
              {t('auth.login')}
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
