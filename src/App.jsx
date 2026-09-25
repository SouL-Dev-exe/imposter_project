/**
 * App.jsx — Root component with HashRouter routing.
 * Hash routing is required for GitHub Pages static hosting.
 * Pages are lazy-loaded for optimal initial bundle size.
 */
import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePackStore } from './store/packStore';
import { useAuthStore } from './store/authStore';
import { useEconomyStore } from './store/economyStore';
import ToastContainer from './components/ToastContainer';

// ─── Lazy-loaded page chunks ───────────────────────────────────────────────
const Home       = lazy(() => import('./pages/Home'));
const Lobby      = lazy(() => import('./pages/Lobby'));
const OnlineLobby = lazy(() => import('./pages/OnlineLobby'));
const Reveal     = lazy(() => import('./pages/Reveal'));
const Clues      = lazy(() => import('./pages/Clues'));
const Vote       = lazy(() => import('./pages/Vote'));
const Result     = lazy(() => import('./pages/Result'));
const PackEditor = lazy(() => import('./pages/PackEditor'));

// ─── Minimal full-screen loader shown while chunks download ───────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 rounded-full border-2 border-violet-500/40 border-t-violet-400 animate-spin" />
    </div>
  );
}

function App() {
  const syncCloudPacks = usePackStore((s) => s.syncCloudPacks);
  const initAuth = useAuthStore((s) => s.initAuth);
  const initEconomy = useEconomyStore((s) => s.initEconomy);

  // Fetch global cloud packs, init auth, then hydrate economy from Supabase
  useEffect(() => {
    syncCloudPacks();
    initAuth().then(() => initEconomy());
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white font-sans antialiased flex flex-col">
        {/* Subtle global noise texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <ToastContainer />
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
      </div>
    </HashRouter>
  );
}

export default App;
