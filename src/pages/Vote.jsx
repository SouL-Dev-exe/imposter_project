/**
 * Vote.jsx — Voting phase.
 * Each player privately casts their vote on the same device (pass-and-play voting).
 * After all votes are cast, results are tallied and the impostor can make a final guess.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { VotePanel } from '../components/game/VotePanel';
import { useGameStore } from '../store/gameStore';
import { tallyVotes, checkWinCondition } from '../utils/gameLogic';
import { useAudio } from '../hooks/useAudio';

export default function Vote() {
  const navigate = useNavigate();
  const {
    players, votes, options,
    castVote, setEliminatedPlayer, setPhase, setWinner,
  } = useGameStore();

  const { playVoteReveal } = useAudio();
  const [voteIndex, setVoteIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [tally, setTally] = useState({});
  const [eliminated, setEliminated] = useState(null);
  const [isTie, setIsTie] = useState(false);

  const activePlayers = players.filter((p) => !p.isEliminated);
  const allVoted = voteIndex >= activePlayers.length;
  const currentVoter = activePlayers[voteIndex];

  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  const handleVoteCast = (voterName, votedFor) => {
    castVote(voterName, votedFor);
    // Advance to next voter
    setTimeout(() => setVoteIndex((i) => i + 1), 800);
  };

  const handleRevealResults = () => {
    playVoteReveal();
    const result = tallyVotes(votes);
    setTally(result.tally);
    setEliminated(result.eliminated);
    setIsTie(result.isTie);
    setShowResults(true);
  };

  const handleProceed = () => {
    if (isTie || !eliminated) {
      // Tie: go back to clues for another round
      navigate('/clues');
      return;
    }

    const eliminatedPlayer = players.find((p) => p.name === eliminated);
    const outcome = checkWinCondition(players, eliminated, 'any');
    setEliminatedPlayer(eliminatedPlayer);

    if (outcome.phase === 'impostor_final_guess') {
      setPhase('result');
      navigate('/result?phase=final_guess');
    } else if (outcome.phase === 'impostors_win') {
      setWinner('impostors');
      navigate('/result');
    } else {
      navigate('/clues');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clues')} className="text-white/40 hover:text-white text-2xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">🗳️ Voting</h1>
          <p className="text-white/40 text-xs">Vote in secret — pass the device</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="voting"
            className="flex-1 flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress bar */}
            <div className="flex gap-1">
              {activePlayers.map((p, i) => (
                <div
                  key={p.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-500
                    ${i < voteIndex ? 'bg-violet-500' : i === voteIndex ? 'bg-violet-300' : 'bg-white/20'}
                  `}
                />
              ))}
            </div>
            <p className="text-white/40 text-xs text-center">
              {allVoted ? 'All votes cast!' : `${voteIndex + 1} of ${activePlayers.length} players voting`}
            </p>

            {!allVoted && currentVoter ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  key={`voter-${voteIndex}`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                >
                  <VotePanel
                    players={activePlayers}
                    voterName={currentVoter.name}
                    onVote={handleVoteCast}
                    hasVoted={!!votes[currentVoter.name]}
                  />
                </motion.div>
              </div>
            ) : allVoted ? (
              <motion.div
                className="flex-1 flex flex-col items-center justify-center gap-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-7xl">📊</div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white">All Votes In!</h2>
                  <p className="text-white/60 text-sm mt-1">Ready to reveal the results?</p>
                </div>
                <Button
                  variant="danger"
                  fullWidth
                  size="xl"
                  onClick={handleRevealResults}
                  icon="🔍"
                >
                  Reveal Results
                </Button>
              </motion.div>
            ) : null}
          </motion.div>
        ) : (
          /* Results reveal */
          <motion.div
            key="results"
            className="flex-1 flex flex-col gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Vote Results</h2>
            </div>

            {/* Tally bars */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              {Object.entries(tally)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => {
                  const maxVotes = Math.max(...Object.values(tally));
                  const pct = (count / maxVotes) * 100;
                  const isElim = name === eliminated;
                  return (
                    <motion.div
                      key={name}
                      className="space-y-1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-bold ${isElim ? 'text-red-400' : 'text-white'}`}>
                          {isElim ? '🎯 ' : ''}{name}
                        </span>
                        <span className="text-white/60">{count} vote{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isElim ? 'bg-red-500' : 'bg-violet-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Verdict */}
            <motion.div
              className={`rounded-2xl p-5 text-center border
                ${isTie
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : 'bg-red-500/20 border-red-500/50'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isTie ? (
                <>
                  <div className="text-4xl mb-2">🤝</div>
                  <p className="text-amber-400 font-black text-xl">It's a Tie!</p>
                  <p className="text-white/60 text-sm mt-1">Nobody is eliminated. Play another clue round!</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">⚡</div>
                  <p className="text-red-400 font-black text-xl">{eliminated} is eliminated!</p>
                  <p className="text-white/60 text-sm mt-1">The group has decided.</p>
                </>
              )}
            </motion.div>

            <Button
              variant="primary"
              fullWidth
              size="xl"
              onClick={handleProceed}
              icon="➡️"
            >
              {isTie ? 'Continue to Clues' : 'See What Happens →'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
