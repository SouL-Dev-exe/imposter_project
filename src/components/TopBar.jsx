/**
 * TopBar.jsx — Tactical top bar with status, language toggle, and armory access.
 * Clean AAA game styling: no emoji, no glow, Lucide icons.
 */
import React from 'react';
import { Globe } from 'lucide-react';
import UserAvatar from './ui/UserAvatar';
import { useLanguageStore } from '../store/languageStore';
import i18n from '../i18n';
import spyRoleLogo from './assets/faviconlogo.png';

export default function TopBar({ profile, onOpenStore, toggleLanguage, currentLang }) {
  const { language, setLanguage } = useLanguageStore();

  const handleToggleLanguage = toggleLanguage || (() => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    if (i18n.language !== nextLang) i18n.changeLanguage(nextLang);
  });

  const activeLang = currentLang || language;

  return (
    <header className="w-full bg-zinc-950 border-b border-zinc-900 px-3.5 py-2 flex items-center justify-between gap-2 relative z-50 font-sans">
      {/* 1. Brand Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.3)]">
          <img src={spyRoleLogo} alt="SpyRole" className="w-5 h-5 object-contain" />
        </div>

        <div className="font-mono text-xs font-bold tracking-wider truncate flex items-center gap-1">
          <span className="text-white drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">
            SPY<span className="text-red-600">ROLE</span>
          </span>
          <span className="hidden sm:inline text-zinc-500 font-normal ml-1.5">// PROTOCOL</span>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language button */}
        <button
          type="button"
          onClick={handleToggleLanguage}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer"
        >
          <Globe size={13} className="text-zinc-400" />
          <span className="text-[11px] font-medium">
            {activeLang === 'ar' ? 'العربية' : 'EN'}
          </span>
        </button>

        {/* User avatar / Store access */}
        <button
          type="button"
          onClick={onOpenStore}
          className="relative p-0.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-colors shrink-0 rounded-lg group cursor-pointer"
          title="Armory / Store"
        >
          <UserAvatar
            username={profile?.username}
            avatarUrl={profile?.avatar_url}
            size="xs"
            showBadge={false}
          />
        </button>
      </div>
    </header>
  );
}
