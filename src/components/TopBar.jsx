import React from 'react';
import UserAvatar from './ui/UserAvatar';
import { useLanguageStore } from '../store/languageStore';
import i18n from '../i18n';

export default function TopBar({ profile, onOpenStore, toggleLanguage, currentLang }) {
  const { language, setLanguage } = useLanguageStore();

  const handleToggleLanguage = toggleLanguage || (() => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    if (i18n.language !== nextLang) i18n.changeLanguage(nextLang);
  });

  const activeLang = currentLang || language;

  return (
    <header className="w-full bg-zinc-950/90 border-b border-red-900/40 px-3 py-2 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(185,28,28,0.15)] relative z-50 backdrop-blur-md">
      
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
        <button
          type="button"
          onClick={handleToggleLanguage}
          className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-red-900/60 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer"
        >
          <span className="text-xs">🌐</span>
          <span className="text-[11px] font-medium">
            {activeLang === 'ar' ? 'العربية' : 'EN'}
          </span>
        </button>

        {/* Avatar du Joueur / Accès Armurerie */}
        <button
          type="button"
          onClick={onOpenStore}
          className="relative p-0.5 border border-red-600/60 bg-zinc-900 hover:border-red-500 transition-all shrink-0 rounded-sm group cursor-pointer"
          title="Armory / Store"
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
    </header>
  );
}

export { TopBar };
