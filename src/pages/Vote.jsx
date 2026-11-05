/**
 * Vote.jsx — Voting phase.
 * Each player privately casts their vote on the same device.
 * Clean, tactical UI: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  BarChart3, 
  Search, 
  Scale, 
  UserX, 
  Crosshair, 
  Vote as VoteIcon 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VotePanel } from '../components/game/VotePanel';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { tallyVotes, checkWinCondition } from '../utils/gameLogic';
import { useAudio } from '../hooks/useAudio';
import { ScreenFXOverlay } from '../components/ui/ScreenFXOverlay';
import { EmoteWheel } from '../components/game/EmoteWheel';

export default function Vote() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguageStore();
  const strings = t();
  const {
    players, votes,
    castVote, setEliminatedPlayer, setPhase, setWinner,
  } = useGameStore();

  const { playVoteReveal } = useAudio();
  const [voteIndex, setVoteIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [tally, setTally] = useState({});
  const [eliminated, setEliminated] = useState(null);
  const [isTie, setIsTie] = useState(false);

  const activePlayers = (players || []).filter((p) => !p.isEliminated);
  const allVoted = voteIndex >= activePlayers.length;
  const currentVoter = activePlayers[voteIndex];

  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  const handleVoteCast = (voterName, votedFor) => {
    castVote(voterName, votedFor);
    setTimeout(() => setVoteIndex((i) => i + 1), 600);
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
      navigate('/clues');
      return;
    }

    const eliminatedPlayer = players.find((p) => p.name === eliminated);
    handleElimination(eliminatedPlayer);
  };

  const handleElimination = (eliminatedPlayer) => {
    setEliminatedPlayer(eliminatedPlayer);

    // Instant Win Condition for Decoy Operative (Fake Impostor)
    if (eliminatedPlayer?.role === 'fake_impostor') {
      setWinner('fake_impostor');
      setPhase('result');
      navigate('/result');
      return;
    }

    const outcome = checkWinCondition(players, eliminated, 'any');
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
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4 relative overflow-hidden font-sans selection:bg-red-600 selection:text-white">
      <ScreenFXOverlay />
      <EmoteWheel />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/clues')}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
            title={strings.nav?.back || 'Back'}
          >
            <ArrowLeft size={18} className="rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{strings.vote?.title || 'Ballot Voting'}</h1>
            <p className="text-zinc-500 text-xs font-mono">{strings.vote?.passTheDevice || 'Cast secret ballots one by one'}</p>
          </div>
        </div>
        <LanguageToggle variant="chip" />
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
            <div className="flex gap-1.5">
              {activePlayers.map((p, i) => (
                <div
                  key={p.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300
                    ${i < voteIndex ? 'bg-red-600' : i === voteIndex ? 'bg-red-500/50' : 'bg-zinc-800'}
                  `}
                />
              ))}
            </div>
            <p className="text-zinc-500 text-xs text-center font-mono">
              {allVoted
                ? (strings.vote?.allVotesCast || 'All Ballots Sealed')
                : (strings.vote?.playersVotingCount
                    ?.replace('{current}', voteIndex + 1)
                    ?.replace('{total}', activePlayers.length) || `Ballot ${voteIndex + 1} of ${activePlayers.length}`)}
            </p>

            {!allVoted && currentVoter ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  key={`voter-${voteIndex}`}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-5"
                  initial={{ x: isRTL ? -30 : 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isRTL ? 30 : -30, opacity: 0 }}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
                  <BarChart3 size={32} />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{strings.vote?.allVotesIn || 'All Votes Cast'}</h2>
                  <p className="text-zinc-400 text-xs mt-1 font-mono">{strings.vote?.readyToReveal || 'Ready to tally and expose suspects'}</p>
                </div>
                <Button
                  variant="danger"
                  fullWidth
                  size="xl"
                  onClick={handleRevealResults}
                  icon={Search}
                >
                  {strings.vote?.revealResults || 'Tally & Reveal Results'}
                </Button>
              </motion.div>
            ) : null}
          </motion.div>
        ) : (
          /* Results reveal */
          <motion.div
            key="results"
            className="flex-1 flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">{strings.vote?.voteResults || 'Ballot Outcome'}</h2>
            </div>

            {/* Tally bars */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3">
              {Object.entries(tally)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => {
                  const maxVotes = Math.max(...Object.values(tally));
                  const pct = (count / maxVotes) * 100;
                  const isElim = name === eliminated;
                  return (
                    <motion.div
                      key={name}
                      className="space-y-1.5"
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold flex items-center gap-1.5 ${isElim ? 'text-red-400' : 'text-zinc-200'}`}>
                          {isElim && <Crosshair size={13} className="text-red-500" />}
                          <span>{name}</span>
                        </span>
                        <span className="text-zinc-500 font-mono">
                          {count} {count === 1 ? (strings.vote?.voteSingle || 'vote') : (strings.vote?.votesPlural || 'votes')}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isElim ? 'bg-red-600' : 'bg-zinc-700'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Verdict */}
            <motion.div
              className={`rounded-xl p-5 text-center border
                ${isTie
                  ? 'bg-amber-950/20 border-amber-600/40 text-amber-300'
                  : 'bg-red-950/20 border-red-600/40 text-red-300'
                }
              `}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isTie ? (
                <div className="space-y-1">
                  <Scale size={32} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-amber-400 font-bold text-lg">{strings.vote?.tieTitle || 'Tie Vote — Deadlock'}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{strings.vote?.tieSubtitle || 'No operative eliminated. Returning to clues.'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <UserX size={32} className="mx-auto mb-2 text-red-500" />
                  <p className="text-red-400 font-bold text-lg">
                    {strings.vote?.eliminatedTitle?.replace('{name}', eliminated) || `${eliminated} Eliminated`}
                  </p>
                  <p className="text-zinc-400 text-xs mt-0.5">{strings.vote?.eliminatedSubtitle || 'Target neutralized by majority consensus'}</p>
                </div>
              )}
            </motion.div>

            <Button
              variant="primary"
              fullWidth
              size="xl"
              onClick={handleProceed}
              icon={ArrowRight}
            >
              {isTie ? (strings.vote?.continueToClues || 'Resume Discussion') : (strings.vote?.seeWhatHappens || 'Proceed to Outcome')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
