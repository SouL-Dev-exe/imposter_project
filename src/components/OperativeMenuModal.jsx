/**
 * OperativeMenuModal.jsx — Side Flyout Tactical Command Terminal
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { useLanguageStore } from '../store/languageStore';
import { UserAvatar } from './ui/UserAvatar';

export default function OperativeMenuModal({ isOpen, onClose, onOpenProfile, onOpenAudio, onOpenStats }) {
  const { profile, signOut } = useAuthStore();
  const { language, toggleLanguage } = useLanguageStore();
  const { equippedAvatarStyle, equipped } = useEconomyStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Flyout Terminal Window */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col font-mono shadow-[0_0_50px_rgba(0,0,0,0.95)]"
      >
        {/* Reticle Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600 pointer-events-none" />

        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/90 bg-black/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-200 uppercase">OPERATIVE TERMINAL</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-zinc-800 hover:border-red-600 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 1. Agent Profile Summary */}
          <div className="p-3 border border-zinc-800 bg-black/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative p-0.5 border border-zinc-700 bg-zinc-950">
                <UserAvatar
                  username={profile?.username || 'GUEST'}
                  avatarStyle={equippedAvatarStyle}
                  equipped={equipped}
                  size="md"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-wider truncate">
                  {profile?.username || 'AGENT'}
                </span>
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest">
                  LVL {profile?.stats?.level || 1} // ACTIVE
                </span>
                <span className="text-[9px] text-zinc-500 truncate">
                  {profile?.email || 'OFFLINE DOSSIER'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="w-full text-center text-[10px] uppercase font-bold tracking-wider text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-red-600 py-2 transition-all cursor-pointer"
              >
                FIELD DOSSIER
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenStats();
                }}
                className="w-full text-center text-[10px] uppercase font-bold tracking-wider text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-red-600 py-2 transition-all cursor-pointer"
              >
                MISSION STATS
              </button>
            </div>
          </div>

          {/* 2. System Language Toggle */}
          <div className="border border-zinc-800/80 bg-zinc-900/30 p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">LANGUAGE</span>
              <span className="text-[9px] text-zinc-500">CIPHER INTERFACE</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="text-xs font-bold tracking-widest bg-zinc-950 border border-zinc-800 hover:border-red-600 text-red-500 hover:text-red-400 px-3 py-1.5 transition-all cursor-pointer"
            >
              {language === 'en' ? '[ EN ]' : '[ العربية ]'}
            </button>
          </div>

          {/* 3. Classified Operational Intel */}
          <div className="border border-zinc-900 bg-black/60 p-3 space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">CLEARANCE PROTOCOL</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Maintain operational secrecy. Deception detected across high-frequency comms. Identify hostile undercover assets before mission failure.
            </p>
          </div>

          {/* 4. Session Termination (Sign Out) */}
          {profile && (
            <div className="pt-2">
              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-widest text-red-500 hover:text-white bg-red-950/20 hover:bg-red-600 border border-red-900/50 hover:border-red-500 transition-all cursor-pointer"
              >
                TERMINATE SESSION
              </button>
            </div>
          )}
        </div>

        {/* Footer Data Stamp */}
        <div className="p-3 border-t border-zinc-800/80 bg-black/80 flex items-center justify-between text-[9px] text-zinc-600">
          <span>SEC-CODE // 099-B</span>
          <span>CLASSIFIED TOP SECRET</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
