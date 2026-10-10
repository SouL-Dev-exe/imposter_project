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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end p-4 backdrop-blur-sm bg-black/40 font-mono"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-950/95 border border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.15)] w-72 h-fit flex flex-col relative mt-12"
        >
          {/* Reticle Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600/50" />

          {/* 1. Operative Briefing Row */}
          <button
            onClick={() => { onClose(); onOpenProfile(); }}
            className="flex items-center gap-3 p-4 border-b border-red-900/30 hover:bg-red-950/30 transition-colors text-left"
          >
            <div className="relative p-0.5 border border-red-600/40 bg-black">
              <UserAvatar
                username={profile?.username || 'GUEST'}
                avatarStyle={equippedAvatarStyle}
                equipped={equipped}
                size="md"
              />
            </div>
            <div>
              <div className="text-zinc-100 font-bold tracking-wider text-sm">
                {profile?.username || 'OPERATIVE'}
              </div>
              <div className="text-red-500 text-[10px] tracking-widest uppercase">
                LVL {profile?.stats?.level || 1} // FIELD AGENT
              </div>
            </div>
          </button>

          <div className="flex flex-col p-2 space-y-1">
            {/* 2. System Language Selector */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
            >
              <span className="uppercase tracking-widest">SYSTEM LANGUAGE</span>
              <span className="text-red-400 font-bold bg-red-950/50 px-2 py-0.5 border border-red-900/50">
                {language === 'en' ? '[ EN ]' : '[ العربية ]'}
              </span>
            </button>

            {/* 3. Audio & Voice Protocols Trigger */}
            <button
              onClick={() => { onClose(); onOpenAudio(); }}
              className="flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
            >
              <span className="uppercase tracking-widest flex items-center gap-2">
                <span>🔊</span> AUDIO PROTOCOLS
              </span>
              <span className="text-zinc-500">→</span>
            </button>

            {/* 4. Agent Metrics & Dossier Trigger */}
            <button
              onClick={() => { onClose(); onOpenStats(); }}
              className="flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
            >
              <span className="uppercase tracking-widest flex items-center gap-2">
                <span>📊</span> AGENT METRICS
              </span>
              <span className="text-zinc-500">→</span>
            </button>
          </div>

          {/* 5. Abort Mission (Logout) */}
          <div className="p-2 border-t border-red-900/30">
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full text-center py-2 text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 transition-colors uppercase tracking-widest border border-red-900/30 hover:border-red-500"
            >
              ABORT MISSION
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
