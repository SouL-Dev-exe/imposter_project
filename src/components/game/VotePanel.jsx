/**
 * VotePanel.jsx — Digital Voting & Tactical Suspect Targeting
 * Black obsidian list, red crosshairs, monospace dossier styling.
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
        className="text-center space-y-3 py-8 font-mono bg-zinc-950 border border-zinc-800 p-6 rounded-sm relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600" />
        <div className="w-12 h-12 border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto rounded-sm">
          ✓
        </div>
        <p className="text-white font-black text-xl tracking-wider uppercase">
          BALLOT ENCRYPTED &amp; LOGGED
        </p>
        <p className="text-zinc-500 text-xs tracking-widest uppercase">
          {strings.reveal.gotItPass}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5 w-full font-mono">
      {/* Voter Prompt Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/40 border border-red-900/60 text-[10px] text-red-400 font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {strings.vote.passToVoter.replace('{name}', voterName)}
        </div>
        <p className="text-2xl font-black text-white uppercase tracking-wider">{voterName}</p>
        <p className="text-zinc-500 text-xs tracking-wider uppercase">{strings.vote.selectSuspicious}</p>
      </div>

      {/* Target Operatives Grid / List */}
      <div className="space-y-2">
        {eligibleTargets.map((player) => {
          const titleId = player.equipped?.title || 'title_novice';
          const titleItem = getStoreItem(titleId) || { name: 'Novice', icon: '🌱', accent: '#3b82f6' };
          const playerName = player.username || player.name;
          const isTargeted = selected === playerName;

          return (
            <motion.button
              key={player.id || playerName}
              onClick={() => setSelected(playerName)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                w-full p-3 rounded-sm border text-start transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 relative
                ${isTargeted
                  ? 'bg-red-950/30 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.35)]'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }
              `}
            >
              {isTargeted && (
                <>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-500" />
                </>
              )}

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-0.5 border ${isTargeted ? 'border-red-500' : 'border-zinc-800'} bg-black`}>
                  <UserAvatar
                    username={playerName}
                    avatarUrl={player.avatar_url}
                    equipped={player.equipped}
                    size="sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate tracking-wide">{playerName}</p>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-none border shadow-sm inline-block truncate uppercase tracking-widest mt-0.5"
                    style={{
                      color: isTargeted ? '#f87171' : titleItem.accent || '#3b82f6',
                      borderColor: isTargeted ? '#dc2626' : `${titleItem.accent || '#3b82f6'}50`,
                      backgroundColor: isTargeted ? 'rgba(220,38,38,0.1)' : `${titleItem.accent || '#3b82f6'}15`,
                    }}
                  >
                    {titleItem.icon} [{titleItem.name}]
                  </span>
                </div>
              </div>

              {isTargeted ? (
                <span className="text-red-500 font-black text-xs px-2 py-1 bg-red-950/80 border border-red-600 animate-pulse tracking-widest">
                  [ TARGET LOCKED ]
                </span>
              ) : (
                <span className="text-zinc-600 text-[10px] tracking-widest font-mono group-hover:text-zinc-400">
                  DESIGNATE
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Confirm Vote Button */}
      <Button
        variant="danger"
        fullWidth
        disabled={!selected}
        onClick={handleConfirm}
        size="lg"
        icon="🗳️"
      >
        {strings.vote.confirmVote}
      </Button>
    </div>
  );
}

export default VotePanel;
