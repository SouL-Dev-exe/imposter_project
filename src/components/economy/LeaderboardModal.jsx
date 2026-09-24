/**
 * LeaderboardModal.jsx
 * Global Supabase Leaderboard — real-time top 100 players ranked by SouL Coins.
 * Fetches from profiles.economy_data via useEconomyStore.fetchLeaderboard().
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';
import { getEconomicRank, STORE_ITEMS } from '../../data/economyCatalog';

function getItemById(id) {
  return STORE_ITEMS.find((i) => i.id === id);
}

function TitleDisplay({ titleId }) {
  const item = titleId ? getItemById(titleId) : null;
  if (!item) return <span className="text-white/30 text-[11px]">Novice</span>;
  return (
    <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: item.accent || '#a78bfa' }}>
      {item.icon} {item.name}
    </span>
  );
}

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardModal({ isOpen, onClose }) {
  const fetchLeaderboard = useEconomyStore((s) => s.fetchLeaderboard);
  const { soulCoins } = useEconomyStore();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    fetchLeaderboard()
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load leaderboard. Check your connection.');
        setLoading(false);
      });
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-yellow-950/60 via-gray-900 to-amber-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                🏆
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Global Leaderboard</h2>
                <p className="text-white/40 text-xs">Top 100 players ranked by SouL Coins</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* My Rank Quick Banner */}
          <div className="px-5 py-3 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span>🪙</span> Your balance: <strong className="text-amber-300 font-bold">{soulCoins.toLocaleString()} SC</strong>
            </span>
            <span className="flex items-center gap-1.5">
              {entries.length > 0 ? (
                <span>Top <strong className="text-white font-bold">{entries.length}</strong> players loaded</span>
              ) : null}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1 p-5 space-y-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-white/40 space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 border-t-amber-400 animate-spin" />
                <p className="text-sm font-medium">Loading leaderboard from Supabase...</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-12 text-red-400 text-sm font-medium">
                <div className="text-3xl mb-2">🚫</div>
                {error}
              </div>
            )}

            {!loading && !error && entries.length === 0 && (
              <div className="text-center py-12 text-white/30 space-y-2">
                <div className="text-4xl">🏜️</div>
                <p className="font-bold">No ranked players yet.</p>
                <p className="text-xs">Complete matches to appear on the global board!</p>
              </div>
            )}

            {!loading && !error && entries.map((entry) => {
              const rank = getEconomicRank(entry.totalCoinsEarned || entry.soulCoins);
              const medal = RANK_MEDALS[entry.rank];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(entry.rank * 0.04, 1.2) }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-transparent border-amber-500/30'
                      : 'bg-white/[0.03] border-white/8 hover:border-white/15'
                  }`}
                >
                  {/* Rank position */}
                  <div className="w-8 text-center shrink-0">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="text-xs font-black text-white/40">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={entry.avatar_url || `https://api.dicebear.com/9.x/bottts/svg?seed=${entry.username}`}
                      alt={entry.username}
                      className="w-9 h-9 rounded-full bg-white/10 border border-white/10"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${entry.username}`;
                      }}
                    />
                    <span
                      className={`absolute -bottom-0.5 -end-0.5 text-[10px] px-1 py-0 rounded-full border font-black ${rank.color} ${rank.border} ${rank.bg}`}
                    >
                      {rank.icon}
                    </span>
                  </div>

                  {/* Username & Title */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{entry.username}</p>
                    <TitleDisplay titleId={entry.equippedTitle} />
                  </div>

                  {/* Level & SC */}
                  <div className="shrink-0 text-end">
                    <p className="text-amber-400 font-black text-sm tabular-nums">
                      🪙 {entry.soulCoins.toLocaleString()}
                    </p>
                    <p className="text-white/40 text-[10px]">Lvl {entry.seasonLevel} · {rank.name}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] text-center text-[11px] text-white/30">
            Data sourced from Supabase profiles in real-time. Updates after each match.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
