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
        className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:items-start p-4 bg-black/60 backdrop-blur-sm font-sans"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#141417] border border-zinc-800/80 shadow-2xl rounded-2xl w-full max-w-sm sm:w-72 sm:mt-16 overflow-hidden flex flex-col"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <UserAvatar
                username={profile?.username || 'Guest'}
                avatarStyle={equippedAvatarStyle}
                equipped={equipped}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  {profile?.username || 'Guest'}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  Level {profile?.stats?.level || 1}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex flex-col p-2 space-y-1">
            {/* Profile Action */}
            <button
              onClick={() => { onClose(); onOpenProfile(); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              View Profile
            </button>

            {/* System Language Selector */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                Language
              </div>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-400">
                {language === 'en' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Audio Settings */}
            <button
              onClick={() => { onClose(); onOpenAudio(); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
              Audio Settings
            </button>
          </div>

          {/* Logout */}
          <div className="p-2 mt-1 border-t border-zinc-800/60">
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
