/**
 * App.jsx — Root component for SpyRole: Undercover Word Game.
 * Clean, tactical dark aesthetics. No emoji, no AI glow, Lucide icons.
 * Hash routing required for GitHub Pages static hosting.
 */
import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { usePackStore } from './store/packStore';
import { useAuthStore } from './store/authStore';
import { useEconomyStore } from './store/economyStore';
import ToastContainer from './components/ToastContainer';
import WelcomeAuthScreen from './components/WelcomeAuthScreen';
import Navbar from './components/Navbar';

// Lazy-loaded page chunks
const Home = lazy(() => import('./pages/Home'));
const Lobby = lazy(() => import('./pages/Lobby'));
const OnlineLobby = lazy(() => import('./pages/OnlineLobby'));
const Reveal = lazy(() => import('./pages/Reveal'));
const Clues = lazy(() => import('./pages/Clues'));
const Vote = lazy(() => import('./pages/Vote'));
const Result = lazy(() => import('./pages/Result'));
const PackEditor = lazy(() => import('./pages/PackEditor'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-red-600 animate-spin" />
      <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Loading</span>
    </div>
  );
}

export default function App() {
  const syncCloudPacks = usePackStore((s) => s.syncCloudPacks);
  const initEconomy = useEconomyStore((s) => s.initEconomy);
  const { user, profile, isGuest, loading, initAuth } = useAuthStore();

  useEffect(() => {
    syncCloudPacks();
    initAuth().then(() => {
      initEconomy();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center gap-4 font-sans select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-zinc-800 border-t-red-600 animate-spin" />
          <Shield size={20} className="text-red-500 absolute" />
        </div>
        <span className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Initializing Operation
        </span>
      </div>
    );
  }

  const isAuthenticated = Boolean(user || isGuest || profile);

  return (
    <div className="min-h-screen bg-black text-zinc-100 bg-game-radial relative overflow-x-hidden font-sans selection:bg-red-600 selection:text-white flex flex-col">
      {/* Subtle top accent divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-red-600/70 to-transparent shrink-0 z-50" />

      <ToastContainer />

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-4 py-4 w-full flex-1 flex flex-col">
        {!isAuthenticated ? (
          <div className="relative z-10 flex-1 flex flex-col">
            <Navbar />
            <WelcomeAuthScreen />
          </div>
        ) : (
          <HashRouter>
            <div className="relative z-10 flex-1 flex flex-col">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/online" element={<OnlineLobby />} />
                  <Route path="/reveal" element={<Reveal />} />
                  <Route path="/clues" element={<Clues />} />
                  <Route path="/vote" element={<Vote />} />
                  <Route path="/result" element={<Result />} />
                  <Route path="/packs" element={<PackEditor />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </HashRouter>
        )}
      </main>
    </div>
  );
}
