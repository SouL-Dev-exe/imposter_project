/**
 * App.jsx — Root component with Premium Clean Dark Mode Layout Wrapper.
 * Hash routing is required for GitHub Pages static hosting.
 * Pages are lazy-loaded for optimal initial bundle size.
 */
import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePackStore } from './store/packStore';
import { useAuthStore } from './store/authStore';
import { useEconomyStore } from './store/economyStore';
import ToastContainer from './components/ToastContainer';
import WelcomeAuthScreen from './components/WelcomeAuthScreen';
import Navbar from './components/Navbar';

// ─── Lazy-loaded page chunks ───────────────────────────────────────────────
const Home        = lazy(() => import('./pages/Home'));
const Lobby       = lazy(() => import('./pages/Lobby'));
const OnlineLobby = lazy(() => import('./pages/OnlineLobby'));
const Reveal      = lazy(() => import('./pages/Reveal'));
const Clues       = lazy(() => import('./pages/Clues'));
const Vote        = lazy(() => import('./pages/Vote'));
const Result      = lazy(() => import('./pages/Result'));
const PackEditor  = lazy(() => import('./pages/PackEditor'));

// ─── Minimal full-screen loader shown while chunks download ───────────────
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin" />
    </div>
  );
}

export default function App() {
  const syncCloudPacks = usePackStore((s) => s.syncCloudPacks);
  const initEconomy = useEconomyStore((s) => s.initEconomy);
  const { user, profile, isGuest, loading, initAuth } = useAuthStore();

  // Fetch global cloud packs, init auth, then hydrate economy
  useEffect(() => {
    syncCloudPacks();
    initAuth().then(() => {
      initEconomy();
    });
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 relative flex flex-col items-center justify-center gap-6 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin" />
        <span className="text-sm text-zinc-500 font-medium tracking-wide">Loading workspace...</span>
      </div>
    );
  }

  // 2. Authentication Check: User logged in or playing as Guest
  const isAuthenticated = Boolean(user || isGuest || profile);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
      <ToastContainer />

      {/* Active App View Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1 flex flex-col">
        {!isAuthenticated ? (
          // First-Time Welcome Gate
          <div className="relative z-10 flex-1 flex flex-col">
            <Navbar />
            <WelcomeAuthScreen />
          </div>
        ) : (
          // Direct Main Game Routes
          <HashRouter>
            <div className="relative z-10 flex-1 flex flex-col">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/"       element={<Home />} />
                  <Route path="/lobby"  element={<Lobby />} />
                  <Route path="/online" element={<OnlineLobby />} />
                  <Route path="/reveal" element={<Reveal />} />
                  <Route path="/clues"  element={<Clues />} />
                  <Route path="/vote"   element={<Vote />} />
                  <Route path="/result" element={<Result />} />
                  <Route path="/packs"  element={<PackEditor />} />
                  {/* Catch-all */}
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
