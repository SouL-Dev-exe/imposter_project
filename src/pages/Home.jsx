import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from '../components/ui/AuthModal';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  const { currentPhase } = useGameStore();
  const { profile } = useAuthStore();
  
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
    <div className="min-h-full w-full flex flex-col relative font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col w-full max-w-xl mx-auto relative z-10 pb-32 px-4 pt-10 space-y-8">
        
        {/* Zone 1: Hero Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Undercover
          </h1>
          <p className="text-sm text-zinc-400 font-medium max-w-xs">
            A social deduction game of deception and hidden roles.
          </p>
        </div>

        {/* Zone 2: Connection Toggle */}
        <div className="flex w-full bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-2xl relative">
          <button
            onClick={() => setIsOnlineMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all z-10 rounded-xl ${
              !isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Offline
          </button>
          <button
            onClick={() => setIsOnlineMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-all z-10 rounded-xl ${
              isOnlineMode ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Online
          </button>
          
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 shadow-sm rounded-xl"
            animate={{ left: isOnlineMode ? 'calc(50% + 2px)' : '4px' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Zone 3: Game Modes Matrix */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => setSelectedMode('conscious')}
            className={`flex flex-col items-start text-left p-5 rounded-2xl transition-all border ${
              selectedMode === 'conscious'
                ? 'bg-zinc-900 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${selectedMode === 'conscious' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span className="text-sm font-semibold text-white mb-1">Conscious</span>
            <span className="text-xs text-zinc-500">Roles are revealed</span>
          </button>

          <button
            onClick={() => setSelectedMode('blind')}
            className={`flex flex-col items-start text-left p-5 rounded-2xl transition-all border ${
              selectedMode === 'blind'
                ? 'bg-zinc-900 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${selectedMode === 'blind' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </div>
            <span className="text-sm font-semibold text-white mb-1">Blind</span>
            <span className="text-xs text-zinc-500">Roles remain hidden</span>
          </button>
        </div>

        {/* Zone 4: Deployment Options */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { setIsOnlineMode(false); navigate('/lobby'); }}
            className={`w-full flex items-center p-4 rounded-2xl transition-all border ${
              !isOnlineMode ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mr-4 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">Pass & Play</div>
              <div className="text-xs text-zinc-500 mt-0.5">Play locally on a single device</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <button
            onClick={() => { setIsOnlineMode(true); if(!profile) setShowAuthModal(true); else navigate('/online'); }}
            className={`w-full flex items-center p-4 rounded-2xl transition-all border ${
              isOnlineMode ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mr-4 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">Multiplayer</div>
              <div className="text-xs text-zinc-500 mt-0.5">Host or join a private room</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Zone 5: Word Packs */}
        <button
          onClick={() => navigate('/packs')}
          className="w-full flex items-center p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 mr-4 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.82A2 2 0 0 0 7.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-white">Word Packs</div>
            <div className="text-xs text-zinc-500 mt-0.5">Manage custom word categories</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m9 18 6-6-6-6"/></svg>
        </button>

      </main>

      {/* Sticky Bottom Command Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/60 z-40">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          
          <button className="w-14 h-14 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 transition-all shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>

          <button
            onClick={hasActiveGame ? handleResume : handleStartOperation}
            className="flex-1 h-14 bg-white hover:bg-zinc-200 text-black rounded-2xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {hasActiveGame ? 'Resume Game' : 'Start Game'}
          </button>

          <button onClick={() => navigate('/packs')} className="w-14 h-14 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 transition-all shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 18h6"/></svg>
          </button>
          
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
