/**
 * VotePanel.jsx — Digital voting component.
 * Each player secretly selects who they think is the impostor.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { getStoreItem } from '../../data/economyCatalog';
import { useLanguageStore } from '../../store/languageStore';

export function VotePanel({ players, voterName, onVote, hasVoted }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const { t } = useLanguageStore();
  const strings = t();

  const eligibleTargets = players.filter((p) => p.name !== voterName && !p.isEliminated);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    onVote(voterName, selected);
  };

  if (confirmed || hasVoted) {
    return (
      <motion.div
        className="text-center space-y-3 py-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-5xl">✅</div>
        <p className="text-white font-bold text-xl">{strings.vote.confirmVote} ✓</p>
        <p className="text-white/50 text-sm">{strings.reveal.gotItPass}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <p className="text-white/60 text-sm uppercase tracking-wider">
          {strings.vote.passToVoter.replace('{name}', voterName)}
        </p>
        <p className="text-white text-2xl font-bold mt-1">{voterName}</p>
        <p className="text-white/50 text-xs mt-1">{strings.vote.selectSuspicious}</p>
      </div>

      <div className="space-y-2.5">
        {eligibleTargets.map((player) => {
          const titleId = player.equipped?.title || 'title_novice';
          const titleItem = getStoreItem(titleId) || { name: 'Novice', icon: '🌱', accent: '#3b82f6' };
          const playerName = player.username || player.name;

          return (
            <motion.button
              key={player.id || playerName}
              onClick={() => setSelected(playerName)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full p-3 rounded-2xl border text-start transition-all duration-200 cursor-pointer flex items-center justify-between gap-3
                ${selected === playerName
                  ? 'bg-red-600/30 border-red-500 text-white shadow-lg shadow-red-600/20'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <UserAvatar
                  username={playerName}
                  avatarUrl={player.avatar_url}
                  equipped={player.equipped}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate">{playerName}</p>
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.2 rounded border shadow-sm inline-block truncate"
                    style={{
                      color: titleItem.accent || '#3b82f6',
                      borderColor: `${titleItem.accent || '#3b82f6'}50`,
                      backgroundColor: `${titleItem.accent || '#3b82f6'}20`,
                    }}
                  >
                    {titleItem.icon} [{titleItem.name}]
                  </span>
                </div>
              </div>

              {selected === playerName && (
                <span className="text-red-400 font-extrabold text-lg animate-bounce shrink-0">🎯</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <Button
        variant="danger"
        fullWidth
        disabled={!selected}
        onClick={handleConfirm}
        size="lg"
      >
        🗳️ {strings.vote.confirmVote}
      </Button>
    </div>
  );
}
