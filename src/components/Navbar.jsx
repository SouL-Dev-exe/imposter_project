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
      <header className="w-full bg-zinc-950/90 border-b border-red-900/40 px-3 py-2 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(185,28,28,0.15)] relative z-40 sticky top-0 backdrop-blur-md font-mono select-none">
        
        {/* 1. LOGO ET TITRE (GAUCHE) */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          {/* Encadrement rétro/spy */}
          <div className="relative p-1 border border-red-600/40 bg-red-950/20 shrink-0">
            <span className="text-sm block">🕵️</span>
            <div className="absolute -top-0.5 -left-0.5 w-1 h-1 border-t border-l border-red-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-b border-r border-red-500" />
          </div>

          {/* Titre tronqué intelligemment sur mobile */}
          <div className="font-mono text-xs font-bold tracking-wider truncate">
            <span className="text-red-500">CLASSIFIED</span>
            <span className="hidden sm:inline text-zinc-500 font-normal ml-1">// UNDERCOVER</span>
          </div>
        </div>

        {/* 2. COMMANDES (DROITE) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Bouton de Langue */}
          <LanguageToggle variant="chip" />

          {/* Avatar du Joueur / Accès Armurerie & Dossier */}
          {profile ? (
            <div className="flex items-center gap-2">
              {/* Black Funds (visible on sm+ screens) */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-red-950/40 border border-red-900/60 px-2 py-1 text-red-200 text-xs hover:border-red-500 transition-colors cursor-pointer"
                title={`${coinsBalance} Credits`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold tracking-wider text-amber-400">
                  {coinsBalance.toLocaleString()}
                </span>
                <span className="text-[9px] text-red-400/80">CR</span>
              </button>

              {/* Avatar button with Scope target */}
              <button
                type="button"
                onClick={() => setIsShopOpen(true)}
                className="relative p-0.5 border border-red-600/60 bg-zinc-900 hover:border-red-500 transition-all shrink-0 rounded-sm group cursor-pointer"
                title={`${profile.username || 'Operative'} · Armory / Dossier`}
              >
                <UserAvatar
                  username={profile?.username}
                  avatarUrl={profile?.avatar_url}
                  size="xs"
                />
                {/* Effet Viseur au survol */}
                <div className="absolute inset-0 border border-red-500/0 group-hover:border-red-500/100 transition-all pointer-events-none" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="bg-red-950/90 hover:bg-red-600 hover:text-black text-red-200 border border-red-700/70 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider transition shadow-[0_0_15px_rgba(185,28,28,0.2)] active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>🔐</span>
              <span className="hidden xs:inline">AUTH</span>
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

