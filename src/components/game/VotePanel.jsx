/**
 * VotePanel.jsx — Digital voting component.
 * Each player secretly selects who they think is the impostor.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

export function VotePanel({ players, voterName, onVote, hasVoted }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

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
        <p className="text-white font-bold text-xl">Vote Cast!</p>
        <p className="text-white/50 text-sm">Pass the device to the next player.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="text-center">
        <p className="text-white/60 text-sm uppercase tracking-wider">Voting as</p>
        <p className="text-white text-2xl font-bold">{voterName}</p>
        <p className="text-white/40 text-xs mt-1">Who do you think is the impostor?</p>
      </div>

      <div className="space-y-2">
        {eligibleTargets.map((player) => (
          <motion.button
            key={player.id}
            onClick={() => setSelected(player.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`
              w-full p-4 rounded-xl border text-left transition-all duration-200
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
                <span className="ml-auto text-red-400">🎯 Suspected</span>
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
        🗳️ Confirm Vote
      </Button>
    </div>
  );
}
