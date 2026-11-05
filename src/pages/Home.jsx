import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { AuthModal } from '../components/ui/AuthModal';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';

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
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-10 pb-20 px-4 pt-6 space-y-6">

        {/* Zone 1: Intelligence Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              UNDERCOVER
            </h1>
            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_8px_#dc2626]" />
          </div>
          
          <div className="bg-red-950/30 border border-red-900/60 px-3 py-1 mt-2">
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              CLASSIFIED INTELLIGENCE &amp; DECEPTION PROTOCOL
            </p>
          </div>
        </div>

        {/* Zone 2: Operational Frequency Toggle */}
        <div className="flex w-full bg-zinc-950 border border-zinc-800 p-1 rounded-sm relative">
          <button
            onClick={() => setIsOnlineMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 cursor-pointer ${
              isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnlineMode ? 'bg-red-600 animate-pulse' : 'bg-zinc-600'}`} />
            NETWORK FREQ
          </button>
          <button
            onClick={() => setIsOnlineMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all z-10 cursor-pointer ${
              !isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>🔒</span>
            LOCAL COVERT
          </button>

          {/* Active indicator pill */}
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-950/60 border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            animate={{ left: isOnlineMode ? '4px' : 'calc(50% + 2px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          />
        </div>

        {/* Zone 3: Mode Directives */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setSelectedMode('conscious')}
            className={`p-3 border rounded-sm cursor-pointer transition-all ${
              selectedMode === 'conscious'
                ? 'bg-zinc-950 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.25)]'
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">STANDARD</span>
              {selectedMode === 'conscious' && <span className="text-red-500 text-xs">●</span>}
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Impostor consciously aware. Requires deception &amp; bluffing.
            </p>
          </div>

          <div
            onClick={() => setSelectedMode('blind')}
            className={`p-3 border rounded-sm cursor-pointer transition-all ${
              selectedMode === 'blind'
                ? 'bg-zinc-950 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.25)]'
                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">BLIND OPS</span>
              {selectedMode === 'blind' && <span className="text-red-500 text-xs">●</span>}
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Impostor receives similar word. Unaware of rogue status.
            </p>
          </div>
        </div>

        {/* Zone 4: Mission Launch Actions */}
        <div className="space-y-3 pt-2">
          {hasActiveGame && (
            <Button
              variant="warning"
              fullWidth
              size="lg"
              onClick={handleResume}
              icon="⚠️"
            >
              RESUME ACTIVE OPERATION
            </Button>
          )}

          <Button
            variant="danger"
            fullWidth
            size="xl"
            onClick={handleStartOperation}
            icon="⚡"
          >
            {isOnlineMode ? 'INITIALIZE NETWORK SESSION' : 'COMMENCE LOCAL OPERATION'}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            size="md"
            onClick={() => navigate('/packs')}
            icon="📁"
          >
            CONFIDENTIAL CIPHER PACKS
          </Button>
        </div>

        {/* Reticle dossier decorative footer */}
        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-600 uppercase tracking-widest">
          <span>OPERATIONAL STATUS: READY</span>
          <span>ENCRYPTION: AES-256</span>
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
