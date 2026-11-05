/**
 * OperativeMenuModal.jsx — Slide-out menu panel
 * Clean, premium, no emoji, Lucide icons.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Globe, LogOut, User, BarChart2, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEconomyStore } from '../store/economyStore';
import { useLanguageStore } from '../store/languageStore';
import { UserAvatar } from './ui/UserAvatar';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function OperativeMenuModal({ isOpen, onClose, onOpenProfile, onOpenAudio, onOpenStats }) {
  const { profile, signOut } = useAuthStore();
  const { language, toggleLanguage } = useLanguageStore();
  const { equippedAvatarStyle, equipped } = useEconomyStore();

  const menuItems = [
    { icon: User, label: 'Profile & Loadout', action: () => { onClose(); onOpenProfile(); } },
    { icon: BarChart2, label: 'Mission Stats', action: () => { onClose(); onOpenStats(); } },
    { icon: Settings, label: 'Settings', action: () => {} },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-game-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-900">
              <span className="text-sm font-semibold text-zinc-100">Menu</span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile card */}
            {profile && (
              <div className="px-4 py-4 border-b border-zinc-900">
                <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0">
                    <UserAvatar
                      username={profile?.username || 'Guest'}
                      avatarStyle={equippedAvatarStyle}
                      equipped={equipped}
                      size="md"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{profile?.username || 'Agent'}</p>
                    <p className="text-xs text-zinc-500 font-mono">Level {profile?.stats?.level || 1}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {menuItems.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer text-left group"
                >
                  <Icon size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </button>
              ))}

              {/* Language */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer text-left group"
              >
                <Globe size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                <span className="flex-1">Language</span>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                  {language === 'en' ? 'EN' : 'AR'}
                </span>
              </button>
            </nav>

            {/* Footer — Sign out */}
            {profile && (
              <div className="px-3 py-3 border-t border-zinc-900">
                <button
                  onClick={async () => { await signOut(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer text-left group"
                >
                  <LogOut size={16} className="shrink-0" />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
