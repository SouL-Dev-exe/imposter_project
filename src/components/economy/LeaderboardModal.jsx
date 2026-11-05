/**
 * LeaderboardModal.jsx
 * Global Supabase Leaderboard — Real-time top 100 operatives ranked by SouL Coins.
 * Rebuilt with elite tactical obsidian aesthetic, zero emojis, Lucide icons, and spring physics.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, X, Award, Crown, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useLanguageStore } from '../../store/languageStore';
import { getEconomicRank, STORE_ITEMS } from '../../data/economyCatalog';
import UserAvatar from '../ui/UserAvatar';

function getItemById(id) {
  return STORE_ITEMS.find((i) => i.id === id);
}

function TitleDisplay({ titleId }) {
  const item = titleId ? getItemById(titleId) : null;
  if (!item) return <span className="text-zinc-500 text-[11px] font-mono">RECRUIT</span>;
  return (
    <span
      className="text-[11px] font-mono font-medium flex items-center gap-1"
      style={{ color: item.accent || '#f43f5e' }}
    >
      [{item.name}]
    </span>
  );
}

export default function LeaderboardModal({ isOpen, onClose }) {
  const fetchLeaderboard = useEconomyStore((s) => s.fetchLeaderboard);
  const { soulCoins } = useEconomyStore();
  const { t } = useLanguageStore();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    fetchLeaderboard()
      .then((data) => {
        setEntries(data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to establish secure link to operative registry.');
        setLoading(false);
      });
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Crimson Accent Line */}
          <div className="h-0.5 w-full bg-red-600" />

          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3 text-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-red-500">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  {t('leaderboard.title')}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">{t('leaderboard.subtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Operative Balance Bar */}
          <div className="px-5 py-2.5 bg-zinc-900/20 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-zinc-400" />
              {t('leaderboard.yourAssets')} <strong className="text-zinc-100 font-semibold">{soulCoins.toLocaleString()} SC</strong>
            </span>
            <span>
              {entries.length > 0 && (
                <span>{t('leaderboard.roster')} <strong className="text-zinc-100">{entries.length}</strong></span>
              )}
            </span>
          </div>

          {/* Table / List */}
          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-3">
                <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
                <p className="text-xs font-mono tracking-wider">{t('leaderboard.loading')}</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-14 text-red-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                <p className="text-xs font-mono">{error}</p>
              </div>
            )}

            {!loading && !error && entries.length === 0 && (
              <div className="text-center py-14 text-zinc-500 space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-zinc-700" />
                <p className="font-medium text-xs text-zinc-400">{t('leaderboard.empty')}</p>
              </div>
            )}

            {!loading && !error && entries.map((entry) => {
              const rank = getEconomicRank(entry.soulCoins);
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(entry.rank * 0.02, 0.4) }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isTop1
                      ? 'bg-zinc-900/90 border-amber-500/40 text-amber-100'
                      : isTop2
                      ? 'bg-zinc-900/60 border-zinc-600/50 text-zinc-100'
                      : isTop3
                      ? 'bg-zinc-900/40 border-amber-700/40 text-zinc-100'
                      : 'bg-zinc-900/20 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  {/* Rank position */}
                  <div className="w-7 text-center shrink-0 flex items-center justify-center">
                    {isTop1 ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : isTop2 ? (
                      <Award className="w-4 h-4 text-zinc-300" />
                    ) : isTop3 ? (
                      <Award className="w-4 h-4 text-amber-600" />
                    ) : (
                      <span className="text-xs font-mono font-medium text-zinc-500">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Operative Avatar */}
                  <div className="relative shrink-0">
                    <UserAvatar
                      username={entry.username}
                      avatarStyle={entry.equippedAvatarStyle || 'bottts'}
                      equipped={entry.equipped}
                      avatarUrl={entry.avatar_url}
                      size="sm"
                    />
                  </div>

                  {/* Username & Equipped Title */}
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium text-xs truncate">{entry.username}</p>
                    <TitleDisplay titleId={entry.equippedTitle} />
                  </div>

                  {/* Level & SC */}
                  <div className="shrink-0 text-end font-mono">
                    <p className="text-zinc-100 font-semibold text-xs flex items-center justify-end gap-1">
                      <Coins className="w-3 h-3 text-red-500" />
                      {entry.soulCoins.toLocaleString()}
                    </p>
                    <p className="text-zinc-500 text-[10px]">LVL {entry.seasonLevel} · {rank.name}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/20 text-center text-[10px] text-zinc-500 font-mono">
            {t('leaderboard.footer')}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
