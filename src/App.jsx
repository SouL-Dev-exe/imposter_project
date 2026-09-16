/**
 * App.jsx — Root component with HashRouter routing.
 * Hash routing is required for GitHub Pages static hosting.
 * Syncs cloud packs from Supabase on launch.
 */
import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Reveal from './pages/Reveal';
import Clues from './pages/Clues';
import Vote from './pages/Vote';
import Result from './pages/Result';
import PackEditor from './pages/PackEditor';
import { usePackStore } from './store/packStore';

function App() {
  const syncCloudPacks = usePackStore((s) => s.syncCloudPacks);

  // Fetch global cloud packs once on app load
  useEffect(() => {
    syncCloudPacks();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
        {/* Subtle global noise texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/reveal" element={<Reveal />} />
            <Route path="/clues" element={<Clues />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/result" element={<Result />} />
            <Route path="/packs" element={<PackEditor />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;

