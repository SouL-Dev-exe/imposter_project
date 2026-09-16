/**
 * Clues.jsx — Clue round tracker.
 * Cycles through players, showing whose turn it is to give a clue.
 * Optional countdown timer per player.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Timer } from '../components/ui/Timer';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';

export default function Clues() {
  const navigate = useNavigate();
  const {
    players, currentClueIndex, options,
    nextClueTurn, goToVote,
  } = useGameStore();

  const { t } = useLanguageStore();
  const strings = t();

  const [timerKey, setTimerKey] = useState(0);
  const [showTimer, setShowTimer] = useState(false);

  const activePlayers = players.filter((p) => !p.isEliminated);
  const totalPlayers = activePlayers.length;

  // Calculate which player and which round
  const clueIndexInRound = currentClueIndex % totalPlayers;
  const currentRound = Math.floor(currentClueIndex / totalPlayers) + 1;
  const currentPlayer = activePlayers[clueIndexInRound];

  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  useEffect(() => {
    // Reset timer when player changes
    setTimerKey((k) => k + 1);
    setShowTimer(false);
    // Auto-show timer if speed mode enabled
    if (options.speedTimer) {
      const t = setTimeout(() => setShowTimer(true), 300);
      return () => clearTimeout(t);
    }
  }, [currentClueIndex, options.speedTimer]);

  const handleNext = () => {
    nextClueTurn();
  };

  const handleGoVote = () => {
    goToVote();
    navigate('/vote');
  };

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {strings.clues.title.replace('{round}', currentRound)}
          </p>
          <h1 className="text-2xl font-black text-white">{strings.clues.title.replace('{round}', currentRound)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-end">
            <p className="text-white/40 text-xs">{strings.reveal.playersLabel}</p>
            <p className="text-violet-400 font-bold">{clueIndexInRound + 1}/{totalPlayers}</p>
          </div>
          <LanguageToggle variant="chip" />
        </div>
      </div>

      {/* Player turn display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentClueIndex}
          className="flex-1 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Avatar */}
          <motion.div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-600 to-purple-800
                       flex items-center justify-center text-5xl font-black text-white
                       shadow-2xl shadow-violet-900/60 border-4 border-violet-400/30"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {currentPlayer.name[0].toUpperCase()}
          </motion.div>

          {/* Player name */}
          <div className="text-center">
            <p className="text-white/50 text-sm uppercase tracking-widest mb-1">
              {strings.clues.whoseTurn.replace('{name}', currentPlayer.name)}
            </p>
            <h2 className="text-4xl font-black text-white">{currentPlayer.name}</h2>
            <p className="text-white/70 text-sm mt-2 font-medium">
              {strings.clues.giveClueInstruction}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {strings.clues.dontBeObvious}
            </p>
          </div>

          {/* Timer */}
          {options.speedTimer && showTimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Timer
                key={timerKey}
                seconds={options.timerSeconds}
                running={true}
                onEnd={() => {}}
                size={120}
              />
            </motion.div>
          )}

          {/* Player list mini-tracker */}
          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-2 text-center">
              {strings.clues.order}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {activePlayers.map((p, i) => (
                <div
                  key={p.id}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                    ${i === clueIndexInRound
                      ? 'bg-violet-600 text-white scale-105 shadow-lg shadow-violet-900/50'
                      : i < clueIndexInRound
                      ? 'bg-white/10 text-white/40 line-through'
                      : 'bg-white/5 text-white/50'
                    }
                  `}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          size="xl"
          onClick={handleNext}
          icon="➡️"
        >
          {strings.clues.nextPlayer}
        </Button>

        <Button
          variant="warning"
          fullWidth
          size="lg"
          onClick={handleGoVote}
          icon="🗳️"
        >
          {strings.clues.finishRoundGoVote}
        </Button>
      </div>
    </div>
  );
}
