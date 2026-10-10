import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { AuthModal } from '../components/ui/AuthModal';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase } = useGameStore();
  const { profile } = useAuthStore();
  const { t } = useLanguageStore();
  
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
    <div className="min-h-full w-full flex flex-col bg-transparent text-zinc-100 relative overflow-x-hidden font-mono selection:bg-red-600 selection:text-black">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Terminal View */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 pb-24 px-4 pt-6 space-y-6">
        
        {/* Zone 1: Intelligence Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <h1 className="text-4xl font-black tracking-widest text-zinc-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            UNDERCOVER
          </h1>
          <div className="bg-red-950/40 border border-red-900/50 px-3 py-1 mt-2">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
              CLASSIFIED INTELLIGENCE & DECEPTION // 3–10 OPERATIVES
            </p>
          </div>
        </div>

        {/* Zone 2: Operational Frequency Toggle */}
        <div className="flex w-full bg-zinc-950/60 border border-zinc-800 p-1 rounded-sm relative">
          <button
            onClick={() => setIsOnlineMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 ${
              isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnlineMode ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-600'}`} />
            NETWORK MODE
          </button>
          <button
            onClick={() => setIsOnlineMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 ${
              !isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>🔒</span>
            OFFLINE MODE
          </button>
          
          {/* Active indicator pill */}
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-900/30 border border-red-600/40"
            animate={{ left: isOnlineMode ? '4px' : 'calc(50% + 2px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Zone 3: Game Modes Matrix */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={() => setSelectedMode('conscious')}
            className={`flex flex-col items-center justify-center p-4 border text-center transition-all relative ${
              selectedMode === 'conscious'
                ? 'border-red-600 bg-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.35)] text-white'
                : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-red-900/50 hover:bg-zinc-900'
            }`}
          >
            {selectedMode === 'conscious' && (
              <>
                <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500" />
                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-red-500" />
                <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-red-500" />
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500" />
              </>
            )}
            <span className="text-2xl mb-2">🕵️</span>
            <span className="text-xs font-bold tracking-wider mb-1">CONSCIOUS IMPOSTOR</span>
            <span className="text-[9px] text-zinc-500 tracking-widest">ROLES REVEALED</span>
          </button>

          <button
            onClick={() => setSelectedMode('blind')}
            className={`flex flex-col items-center justify-center p-4 border text-center transition-all relative ${
              selectedMode === 'blind'
                ? 'border-red-600 bg-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.35)] text-white'
                : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-red-900/50 hover:bg-zinc-900'
            }`}
          >
            {selectedMode === 'blind' && (
              <>
                <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-red-500" />
                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-red-500" />
                <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-red-500" />
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-red-500" />
              </>
            )}
            <span className="text-2xl mb-2">👤</span>
            <span className="text-xs font-bold tracking-wider mb-1">BLIND INFILTRATOR</span>
            <span className="text-[9px] text-zinc-500 tracking-widest">HIDDEN ROLES</span>
          </button>
        </div>

        {/* Zone 4: Lobby Deployment Options */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => { setIsOnlineMode(false); navigate('/lobby'); }}
            className={`w-full flex items-center justify-between p-3 border transition-colors ${
              !isOnlineMode ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📱</span>
              <div className="text-left">
                <div className="text-xs font-bold tracking-widest text-zinc-200">PASS & PLAY</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">LOCAL BRIEFING (OFFLINE)</div>
              </div>
            </div>
            <span className="text-zinc-600">→</span>
          </button>

          <button
            onClick={() => { setIsOnlineMode(true); if(!profile) setShowAuthModal(true); else navigate('/online'); }}
            className={`w-full flex items-center justify-between p-3 border transition-colors ${
              isOnlineMode ? 'border-red-900/50 bg-red-950/10' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🌐</span>
              <div className="text-left">
                <div className="text-xs font-bold tracking-widest text-zinc-200">INTERCEPT OPERATION</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">SECURE ONLINE FREQUENCY</div>
              </div>
            </div>
            <span className="text-zinc-600">→</span>
          </button>
        </div>

        {/* Zone 5: Word Packs Folder */}
        <button
          onClick={() => navigate('/packs')}
          className="w-full flex items-center justify-between p-3 border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-red-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📁</span>
            <div className="text-left">
              <div className="text-xs font-bold tracking-widest text-amber-500 uppercase">CLASSIFIED WORD PACKS</div>
              <div className="text-[10px] text-zinc-500 tracking-wider">MANAGE ASSETS & CATEGORIES</div>
            </div>
          </div>
          <span className="text-zinc-600">→</span>
        </button>

      </main>

      {/* Sticky Bottom Command Dock */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-zinc-950/95 border-t border-red-900/50 backdrop-blur-md z-40 flex items-center justify-between max-w-md mx-auto w-full gap-2 pb-safe">
        
        {/* Left Utility */}
        <button className="w-12 h-12 flex flex-col items-center justify-center border border-zinc-800 bg-black hover:border-red-600 transition-colors shrink-0">
          <span className="text-lg">⚙️</span>
          <span className="text-[8px] text-zinc-500 tracking-widest uppercase mt-0.5">SYS</span>
        </button>

        {/* Center Primary CTA */}
        <button
          onClick={hasActiveGame ? handleResume : handleStartOperation}
          className="flex-1 h-12 relative group bg-gradient-to-r from-red-700 via-red-600 to-amber-600 border border-red-500 hover:border-amber-400 overflow-hidden flex flex-col items-center justify-center transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/50" />
          
          <span className="relative z-10 text-white font-black tracking-[0.2em] text-sm uppercase">
            {hasActiveGame ? 'RESUME OPERATION' : 'START OPERATION'}
          </span>
          <span className="relative z-10 text-[9px] text-white/70 tracking-widest font-bold mt-0.5">
            {isOnlineMode ? 'SECURE CONNECTION' : 'OFFLINE MODE READY'}
          </span>
        </button>

        {/* Right Utility */}
        <button onClick={() => navigate('/packs')} className="w-12 h-12 flex flex-col items-center justify-center border border-zinc-800 bg-black hover:border-red-600 transition-colors shrink-0">
          <span className="text-lg">📦</span>
          <span className="text-[8px] text-zinc-500 tracking-widest uppercase mt-0.5">ARMORY</span>
        </button>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
