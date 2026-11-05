/**
 * VotePanel.jsx — Digital Voting & Target Selection
 * Clean, tactical UI: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2, Crosshair, UserCheck, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { getStoreItem } from '../../data/economyCatalog';
import { useLanguageStore } from '../../store/languageStore';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

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
        className="text-center space-y-3 py-6 bg-zinc-950 border border-zinc-800 p-6 rounded-xl relative font-sans"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-12 h-12 border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex items-center justify-center rounded-xl mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="text-white font-bold text-lg tracking-tight">
            {t('vote.allVotesCast')}
          </p>
          <p className="text-zinc-500 text-xs mt-1 font-mono">
            {t('reveal.gotItPass')}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 w-full font-sans">
      {/* Voter Prompt Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 font-mono">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {strings.vote?.passToVoter?.replace('{name}', voterName) || `Voter: ${voterName}`}
        </div>
        <p className="text-2xl font-black text-white tracking-tight">{voterName}</p>
        <p className="text-zinc-500 text-xs font-mono">{strings.vote?.selectSuspicious || 'Select the suspected infiltrator'}</p>
      </div>

      {/* Target Operatives Grid */}
      <div className="space-y-2">
        {eligibleTargets.map((player) => {
          const titleId = player.equipped?.title || 'title_novice';
          const titleItem = getStoreItem(titleId) || { name: 'Novice', accent: '#dc2626' };
          const playerName = player.username || player.name;
          const isTargeted = selected === playerName;

          return (
            <motion.button
              key={player.id || playerName}
              type="button"
              onClick={() => setSelected(playerName)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={spring}
              className={`
                w-full p-3 rounded-xl border text-start transition-colors duration-150 cursor-pointer flex items-center justify-between gap-3
                ${isTargeted
                  ? 'bg-red-950/20 border-red-600/80 text-white'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="rounded-lg overflow-hidden bg-zinc-950 p-0.5 border border-zinc-800">
                  <UserAvatar
                    username={playerName}
                    avatarUrl={player.avatar_url}
                    equipped={player.equipped}
                    size="sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-white truncate">{playerName}</p>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block mt-0.5"
                    style={{
                      color: isTargeted ? '#f87171' : titleItem.accent || '#dc2626',
                      backgroundColor: isTargeted ? 'rgba(220,38,38,0.15)' : `${titleItem.accent || '#dc2626'}12`,
                    }}
                  >
                    [{titleItem.name}]
                  </span>
                </div>
              </div>

              {isTargeted ? (
                <span className="flex items-center gap-1 text-red-400 font-mono text-xs px-2.5 py-1 bg-red-950/40 border border-red-600/50 rounded-lg">
                  <Crosshair size={13} className="text-red-500" />
                  {t('vote.lockTarget')}
                </span>
              ) : (
                <span className="text-zinc-600 text-xs font-mono">
                  {t('dir') === 'rtl' ? 'تحديد' : 'Designate'}
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
        icon={Vote}
      >
        {strings.vote?.confirmVote || 'Lock In Vote'}
      </Button>
    </div>
  );
}

export default VotePanel;
