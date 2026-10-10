/**
 * App.jsx — Noir Tactical Viewport-Locked Layout
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
      <div className="w-8 h-8 rounded-full border-2 border-rose-900 border-t-rose-500 animate-spin" />
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
      <div className="h-screen w-screen bg-[#08080a] bg-spy-radial text-zinc-100 relative flex flex-col items-center justify-center gap-6 font-mono overflow-hidden">
        <div className="absolute inset-0 bg-crt-lines z-0" />
        <div className="relative z-10 w-8 h-8 rounded-full border-2 border-rose-900 border-t-rose-600 animate-spin" />
        <span className="relative z-10 text-xs text-rose-500 font-bold tracking-widest uppercase">Booting Terminal...</span>
      </div>
    );
  }

  const isAuthenticated = Boolean(user || isGuest || profile);

  return (
    <div className="h-screen w-screen bg-[#08080a] bg-spy-radial text-zinc-100 relative overflow-hidden font-mono selection:bg-rose-600/30 selection:text-rose-200 flex flex-col">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-crt-lines pointer-events-none z-[100]" />

      <ToastContainer />

      <main className="max-w-3xl mx-auto w-full h-full flex flex-col relative z-10">
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <Navbar />
            <WelcomeAuthScreen />
          </div>
        ) : (
          <HashRouter>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
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
