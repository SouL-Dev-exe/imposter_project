/**
 * App.jsx — Root component with HashRouter routing and First-Time Welcome Gate.
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-bounce">🕵️‍♂️</div>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">جاري التحميل...</span>
      </div>
    );
  }

  // 2. Authentication Check: User logged in or playing as Guest
  const isAuthenticated = Boolean(user || isGuest || profile);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased flex flex-col dir-rtl">
      {/* Subtle global noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <ToastContainer />

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
    </div>
  );
}
