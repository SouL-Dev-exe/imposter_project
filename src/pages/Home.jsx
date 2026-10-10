import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from '../components/ui/AuthModal';

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase } = useGameStore();
  const { profile } = useAuthStore();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [selectedMode, setSelectedMode] = useState('conscious'); // 'conscious' or 'blind'

  const hasActiveGame = currentPhase !== 'home' && currentPhase !== 'lobby' && currentPhase !== 'result';

  const handleStartOperation = () => {
    if (isOnlineMode) {
      if (!profile) setShowAuthModal(true);
      else navigate('/online');
    } else {
      navigate('/lobby');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative z-10 px-2 sm:px-4 pb-20 sm:pb-24 pt-4 overflow-y-auto no-scrollbar">
      
      {/* Zone A: Operational Frequency */}
      <div className="w-full flex bg-[#111116] border border-zinc-800 p-1 mb-4">
        <button
          onClick={() => setIsOnlineMode(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
            isOnlineMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnlineMode ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]' : 'bg-zinc-600'}`} />
          <span>ONLINE FREQUENCY</span>
          {isOnlineMode && <span className="hidden sm:inline text-zinc-400 font-normal"> // ENCRYPTED</span>}
        </button>
        <button
          onClick={() => setIsOnlineMode(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${
            !isOnlineMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>🔒</span>
          <span>OFFLINE BUNKER</span>
        </button>
      </div>

      {/* Zone B: Game Mode Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-4">
        <button
          onClick={() => setSelectedMode('conscious')}
          className={`relative p-4 border flex flex-col items-start transition-all ${
            selectedMode === 'conscious'
              ? 'bg-[#111116] border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
              : 'bg-[#0b0b0e] border-zinc-800 hover:border-rose-900/50'
          }`}
        >
          {selectedMode === 'conscious' && (
            <>
              <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-rose-500" />
              <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-rose-500" />
              <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-rose-500" />
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-rose-500" />
            </>
          )}
          <span className="text-xl mb-2">🎭</span>
          <span className={`text-xs font-bold tracking-widest mb-1 ${selectedMode === 'conscious' ? 'text-rose-500' : 'text-zinc-300'}`}>CONSCIOUS IMPOSTOR</span>
          <span className="text-[9px] text-zinc-500 tracking-wider uppercase">ROLES REVEALED</span>
        </button>

        <button
          onClick={() => setSelectedMode('blind')}
          className={`relative p-4 border flex flex-col items-start transition-all ${
            selectedMode === 'blind'
              ? 'bg-[#111116] border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.3)]'
              : 'bg-[#0b0b0e] border-zinc-800 hover:border-rose-900/50'
          }`}
        >
          {selectedMode === 'blind' && (
            <>
              <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-rose-500" />
              <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-rose-500" />
              <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-rose-500" />
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-rose-500" />
            </>
          )}
          <span className="text-xl mb-2">👤</span>
          <span className={`text-xs font-bold tracking-widest mb-1 ${selectedMode === 'blind' ? 'text-rose-500' : 'text-zinc-300'}`}>BLIND INFILTRATOR</span>
          <span className="text-[9px] text-zinc-500 tracking-wider uppercase">HIDDEN ROLES / UNKNOWN ENEMY</span>
        </button>
      </div>

      {/* Zone C: Deployment Pathways & Word Packs */}
      <div className="flex flex-col gap-3 w-full mb-4">
        
        {isOnlineMode ? (
          <div className="flex items-center justify-between p-3 bg-[#111116] border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-lg">🌐</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-200 tracking-widest">INTERCEPT OPERATION</span>
                <span className="text-[9px] text-cyan-500 tracking-wider uppercase">ONLINE LOBBY // FREQ: ACTIVE</span>
              </div>
            </div>
            <span className="text-zinc-600">→</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-[#111116] border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-lg">📱</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-200 tracking-widest">LOCAL BRIEFING</span>
                <span className="text-[9px] text-zinc-500 tracking-wider uppercase">PASS & PLAY</span>
              </div>
            </div>
            <span className="text-zinc-600">→</span>
          </div>
        )}

        <button
          onClick={() => navigate('/packs')}
          className="flex items-center justify-between p-3 bg-[#111116] border border-zinc-800 hover:border-amber-600/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📁</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-amber-500 tracking-widest">CLASSIFIED WORD PACKS</span>
              <span className="text-[9px] text-zinc-500 tracking-wider uppercase">ACTIVE: Food, Anime, Tech...</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 group-hover:text-amber-500 tracking-widest uppercase">MANAGE</span>
        </button>

      </div>

      {/* Sticky Command Dock */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-[#111116]/95 backdrop-blur-md border-t border-zinc-800/80 z-40 flex items-center gap-2 w-full pb-safe">
        
        {/* Secondary: Protocols */}
        <button className="w-12 h-12 flex flex-col items-center justify-center border border-zinc-800 bg-[#08080a] hover:border-rose-600 transition-colors shrink-0">
          <span className="text-sm mb-0.5">⚙️</span>
          <span className="text-[7px] text-zinc-500 tracking-widest">SYS</span>
        </button>

        {/* Primary CTA */}
        <button
          onClick={handleStartOperation}
          className="flex-1 h-12 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 flex flex-col items-center justify-center relative overflow-hidden transition-transform active:scale-[0.98] shadow-[0_0_15px_rgba(225,29,72,0.3)]"
        >
          {/* Reticles */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/50" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/50" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50" />
          
          <span className="text-xs font-black tracking-[0.2em] text-white">
            {hasActiveGame ? 'RESUME OPERATION' : 'START OPERATION'}
          </span>
          <span className="text-[8px] text-white/80 font-bold tracking-widest uppercase mt-0.5">
            {isOnlineMode ? 'READY: 8/10 AGENTS' : 'OFFLINE BUNKER READY'}
          </span>
        </button>

        {/* Secondary: Dossier */}
        <button className="hidden xs:flex w-12 h-12 flex-col items-center justify-center border border-zinc-800 bg-[#08080a] hover:border-rose-600 transition-colors shrink-0">
          <span className="text-sm mb-0.5">📊</span>
          <span className="text-[7px] text-zinc-500 tracking-widest">STAT</span>
        </button>

        {/* Secondary: Armory */}
        <button className="w-12 h-12 flex flex-col items-center justify-center border border-zinc-800 bg-[#08080a] hover:border-amber-600 transition-colors shrink-0">
          <span className="text-sm mb-0.5">📦</span>
          <span className="text-[7px] text-amber-500 tracking-widest">ARMORY</span>
        </button>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
