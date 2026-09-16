/**
 * Result.jsx — Game result screen.
 * Shows the winner, reveals all roles, and handles the impostor final guess flow.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { FinalGuess } from '../components/game/FinalGuess';
import { Modal } from '../components/ui/Modal';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';
import { ROLES } from '../utils/gameLogic';

const ROLE_LABELS = {
  [ROLES.CIVILIAN]: { label: 'Civilian', emoji: '👤', color: 'text-blue-400' },
  [ROLES.IMPOSTOR]: { label: 'Impostor', emoji: '🕵️', color: 'text-red-400' },
  [ROLES.MR_WHITE]: { label: 'Mr. White', emoji: '❓', color: 'text-gray-400' },
};

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFinalGuessPhase = searchParams.get('phase') === 'final_guess';

  const {
    players, winner, eliminatedPlayer, wordPair, gameMode,
    setFinalGuessResult, setWinner, resetToLobby, resetGame,
  } = useGameStore();

  const { playWin, playLose } = useAudio();
  const [showFinalGuess, setShowFinalGuess] = useState(isFinalGuessPhase);
  const [finalGuessResolved, setFinalGuessResolved] = useState(false);
  const [revealRoles, setRevealRoles] = useState(false);

  useEffect(() => {
    if (!players || players.length === 0) {
      navigate('/');
      return;
    }
    // Play win/lose audio if we have a winner
    if (winner === 'civilians') {
      setTimeout(() => playWin(), 300);
    } else if (winner === 'impostors') {
      setTimeout(() => playLose(), 300);
    }
  }, [winner]);

  const handleFinalGuessResult = (isCorrect) => {
    setFinalGuessResult(isCorrect);
    setShowFinalGuess(false);
    setFinalGuessResolved(true);
    if (isCorrect) {
      setWinner('impostors');
    } else {
      setWinner('civilians');
    }
  };

  const handlePlayAgain = () => {
    resetToLobby();
    navigate('/lobby');
  };

  const handleHome = () => {
    resetGame();
    navigate('/');
  };

  // Determine win info
  const winnerInfo = {
    civilians: {
      emoji: '🎊',
      title: 'Civilians Win!',
      subtitle: 'The impostor has been unmasked.',
      gradient: 'from-blue-600 to-cyan-600',
      glow: 'shadow-blue-900/50',
    },
    impostors: {
      emoji: '🏆',
      title: 'Impostor Wins!',
      subtitle: 'The deception was flawless.',
      gradient: 'from-red-700 to-rose-700',
      glow: 'shadow-red-900/50',
    },
  };

  const info = winner ? winnerInfo[winner] : null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-5">
      {/* Final Guess Phase (before winner is decided) */}
      {isFinalGuessPhase && !finalGuessResolved && (
        <AnimatePresence>
          {showFinalGuess && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div
                className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-t-3xl p-6 pb-10"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
                <FinalGuess
                  eliminatedPlayer={eliminatedPlayer}
                  secretWord={wordPair?.wordA}
                  wordPair={wordPair}
                  onResult={handleFinalGuessResult}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Winner reveal */}
      {winner && info && (
        <motion.div
          className={`rounded-3xl bg-gradient-to-br ${info.gradient} p-1 shadow-2xl ${info.glow}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
        >
          <div className="bg-gray-950/70 rounded-3xl p-8 text-center space-y-3">
            <motion.div
              className="text-7xl"
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {info.emoji}
            </motion.div>
            <h1 className="text-4xl font-black text-white">{info.title}</h1>
            <p className="text-white/60">{info.subtitle}</p>
          </div>
        </motion.div>
      )}

      {/* Word reveal */}
      {wordPair && (
        <motion.div
          className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/40 text-xs uppercase tracking-wider">The Secret Words</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-white/40 text-xs mb-1">Civilians</p>
              <p className="text-2xl font-black text-blue-400">{wordPair.wordA}</p>
            </div>
            <div className="text-white/20 text-xl">vs</div>
            <div className="text-center">
              <p className="text-white/40 text-xs mb-1">Impostor</p>
              <p className="text-2xl font-black text-red-400">
                {gameMode === 'blind' ? wordPair.wordB : '(none)'}
              </p>
            </div>
          </div>
          <p className="text-white/30 text-xs">Category: {wordPair.category}</p>
        </motion.div>
      )}

      {/* Role reveal button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => setRevealRoles((r) => !r)}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60
                     hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
        >
          {revealRoles ? '🙈 Hide Roles' : '👁️ Reveal All Roles'}
        </button>

        <AnimatePresence>
          {revealRoles && (
            <motion.div
              className="mt-3 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {players.map((p, i) => {
                const roleCfg = ROLE_LABELS[p.role] || ROLE_LABELS[ROLES.CIVILIAN];
                return (
                  <motion.div
                    key={p.id}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <span className="text-xl">{roleCfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold">{p.name}</p>
                      <p className={`text-xs ${roleCfg.color}`}>{roleCfg.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm font-medium">
                        {p.role === ROLES.IMPOSTOR && gameMode === 'blind'
                          ? wordPair?.wordB
                          : p.role === ROLES.CIVILIAN
                          ? wordPair?.wordA
                          : '—'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button variant="primary" fullWidth size="xl" onClick={handlePlayAgain} icon="🔄">
          Play Again
        </Button>
        <Button variant="ghost" fullWidth size="md" onClick={handleHome}>
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
