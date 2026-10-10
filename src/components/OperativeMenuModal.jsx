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
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Flyout Terminal */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-80 bg-zinc-950/90 border-l border-rose-900/40 backdrop-blur-lg z-50 flex flex-col font-mono shadow-[0_0_50px_rgba(225,29,72,0.15)]"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-400">OPERATIVE TERMINAL</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-rose-500 transition-colors">
            <span className="text-lg">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* 1. Agent Profile Summary */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative p-0.5 border border-zinc-700 bg-black">
                <UserAvatar
                  username={profile?.username || 'GUEST'}
                  avatarStyle={equippedAvatarStyle}
                  equipped={equipped}
                  size="md"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wider">{profile?.username || 'AGENT'}</span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                  LVL {profile?.stats?.level || 1} // ACTIVE
                </span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onOpenProfile(); }}
              className="w-full text-left text-[10px] uppercase tracking-[0.1em] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 p-2 text-center transition-colors"
            >
              VIEW DOSSIER
            </button>
          </div>

          {/* 2. System Language Toggle */}
          <div className="border-t border-zinc-800/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">SYSTEM LANGUAGE</span>
              <button
                onClick={toggleLanguage}
                className="text-[10px] font-bold tracking-widest bg-zinc-900 border border-zinc-800 text-rose-500 hover:text-rose-400 hover:border-rose-900/50 px-2 py-1 transition-all"
              >
                {language === 'en' ? '[ EN ]' : '[ العربية ]'}
              </button>
            </div>
          </div>

          {/* 3. Audio & Voice Protocols */}
          <div className="border-t border-zinc-800/50 pt-4 space-y-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">AUDIO PROTOCOLS</span>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>MASTER VOLUME</span>
                <span>80%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900"><div className="h-full w-4/5 bg-cyan-500" /></div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>MIC GAIN</span>
                <span>50%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900"><div className="h-full w-1/2 bg-rose-500" /></div>
            </div>
          </div>

          {/* 4. Mission Statistics */}
          <div className="border-t border-zinc-800/50 pt-4 space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">MISSION STATS</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900/50 border border-zinc-800 p-2 flex flex-col">
                <span className="text-[10px] text-zinc-500">WIN RATE</span>
                <span className="text-sm font-bold text-white">{profile?.stats?.win_rate || 0}%</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-2 flex flex-col">
                <span className="text-[10px] text-zinc-500">OPERATIONS</span>
                <span className="text-sm font-bold text-white">{profile?.stats?.games_played || 0}</span>
              </div>
            </div>
          </div>

          {/* 5. System Protocols */}
          <div className="border-t border-zinc-800/50 pt-4">
            <button className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-white uppercase tracking-widest group">
              <span className="flex items-center gap-2"><span>⚙️</span> SYSTEM PROTOCOLS</span>
              <span className="text-zinc-600 group-hover:text-white">→</span>
            </button>
          </div>

        </div>

        {/* 6. Abort Mission (Logout) */}
        <div className="p-4 border-t border-zinc-800/80 bg-black/40">
          <button
            onClick={() => { onClose(); signOut(); }}
            className="w-full py-3 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900 hover:border-rose-500 text-rose-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
          >
            ABORT MISSION
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
