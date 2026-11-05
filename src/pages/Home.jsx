/**
 * Home.jsx — Main Landing Screen.
 * Tactical AAA game design: clean, dark, no emoji, no glow, Lucide icons.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Users, 
  Zap, 
  AlertTriangle, 
  FolderLock, 
  ShieldCheck, 
  Radio, 
  Eye, 
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { AuthModal } from '../components/ui/AuthModal';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import spyRoleLogo from '../components/assets/faviconlogo.png';

const spring = { type: 'spring', stiffness: 400, damping: 28 };

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase } = useGameStore();
  const { profile } = useAuthStore();
  const { t, isRTL } = useLanguageStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState('conscious'); // 'conscious' or 'blind'

  const hasActiveGame = currentPhase !== 'home' && currentPhase !== 'lobby' && currentPhase !== 'result';

  const handleResume = () => {
    const routes = { reveal: '/reveal', clues: '/clues', vote: '/vote', result: '/result' };
    navigate(routes[currentPhase] || '/lobby');
  };

  const handleStartOperation = () => {
    if (isOnlineMode) {
      if (!profile) setShowAuthModal(true);
      else navigate('/online');
    } else {
      navigate('/lobby');
    }
  };

  return (
    <div className="min-h-full w-full flex flex-col bg-transparent text-zinc-100 relative overflow-x-hidden font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Terminal View */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 pb-16 px-4 pt-6 space-y-6">

        {/* Zone 1: Intelligence Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border border-zinc-800 p-2 flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.3)] relative"
          >
            <img
              src={spyRoleLogo}
              alt="SpyRole"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="flex flex-col items-center"
          >
            <span className="text-[11px] font-mono tracking-widest text-red-500 uppercase font-semibold">
              {t('home.protocol')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-1">
              SPY<span className="text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">ROLE</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              {t('home.tagline')}
            </p>
          </motion.div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[11px] text-zinc-400 font-mono tracking-wider uppercase">
              {t('home.systemReady')}
            </p>
          </div>
        </div>

        {/* Zone 2: Mode Selector (Online vs Local) */}
        <div className="flex w-full bg-zinc-950 border border-zinc-800 p-1 rounded-xl relative">
          <button
            type="button"
            onClick={() => setIsOnlineMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors z-10 cursor-pointer rounded-lg ${
              !isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users size={15} className={!isOnlineMode ? 'text-red-500' : 'text-zinc-500'} />
            {t('home.localPassPlay')}
          </button>
          
          <button
            type="button"
            onClick={() => setIsOnlineMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors z-10 cursor-pointer rounded-lg ${
              isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Wifi size={15} className={isOnlineMode ? 'text-red-500' : 'text-zinc-500'} />
            {t('home.onlineRoom')}
          </button>

          {/* Active indicator pill with spring animation (RTL-aware) */}
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-900 border border-zinc-700/70 rounded-lg shadow-sm"
            animate={{ [isRTL ? 'right' : 'left']: !isOnlineMode ? '4px' : 'calc(50% + 2px)' }}
            transition={spring}
          />
        </div>

        {/* Zone 3: Mode Directives */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={spring}
            onClick={() => setSelectedMode('conscious')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
              selectedMode === 'conscious'
                ? 'bg-zinc-900 border-red-600/80 text-white shadow-sm'
                : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Eye size={14} className={selectedMode === 'conscious' ? 'text-red-500' : 'text-zinc-500'} />
                {t('home.standardMode')}
              </span>
              {selectedMode === 'conscious' && (
                <CheckCircle2 size={13} className="text-red-500" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('home.standardDesc')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={spring}
            onClick={() => setSelectedMode('blind')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
              selectedMode === 'blind'
                ? 'bg-zinc-900 border-red-600/80 text-white shadow-sm'
                : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <EyeOff size={14} className={selectedMode === 'blind' ? 'text-red-500' : 'text-zinc-500'} />
                {t('home.blindMode')}
              </span>
              {selectedMode === 'blind' && (
                <CheckCircle2 size={13} className="text-red-500" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('home.blindDesc')}
            </p>
          </motion.div>
        </div>

        {/* Zone 4: Mission Launch Actions */}
        <div className="space-y-3 pt-1">
          {hasActiveGame && (
            <Button
              variant="warning"
              fullWidth
              size="lg"
              onClick={handleResume}
              icon={AlertTriangle}
            >
              {t('home.resumeMatch')}
            </Button>
          )}

          <Button
            variant="primary"
            fullWidth
            size="xl"
            onClick={handleStartOperation}
            icon={Zap}
          >
            {isOnlineMode ? t('home.startOnline') : t('home.startLocal')}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            size="md"
            onClick={() => navigate('/packs')}
            icon={FolderLock}
          >
            {t('home.wordPacks')}
          </Button>
        </div>

        {/* Clean footer status bar */}
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Radio size={12} className="text-zinc-400" />
            {t('home.statusOperational')}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-zinc-400" />
            {t('home.privateSession')}
          </span>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
