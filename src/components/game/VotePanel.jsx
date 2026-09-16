/**
 * VotePanel.jsx — Digital voting component.
 * Each player secretly selects who they think is the impostor.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
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

      <div className="space-y-2">
        {eligibleTargets.map((player) => (
          <motion.button
            key={player.id}
            onClick={() => setSelected(player.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`
              w-full p-4 rounded-xl border text-start transition-all duration-200 cursor-pointer
              ${selected === player.name
                ? 'bg-red-600/30 border-red-500 text-white'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${selected === player.name ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}
              `}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-semibold">{player.name}</span>
              {selected === player.name && (
                <span className="ms-auto text-red-400">🎯</span>
              )}
            </div>
          </motion.button>
        ))}
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
