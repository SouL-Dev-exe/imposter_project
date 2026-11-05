/**
 * Reveal.jsx — Pass-and-Play role reveal phase.
 * Players take turns viewing their secret role card on the same device.
 * Clean, tactical UI: no emoji, no glow, Lucide icons.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, MessageSquare, ShieldCheck, Users } from 'lucide-react';
import { RoleReveal } from '../components/game/RoleReveal';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';

export default function Reveal() {
  const navigate = useNavigate();
  const {
    players, currentRevealIndex, gameMode,
    markRevealed, goToClues,
  } = useGameStore();

  const { t } = useLanguageStore();
  const strings = t();

  // Guard: redirect if no game session
  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  if (!players || players.length === 0) return null;

  const allRevealed = currentRevealIndex >= players.length;
  const currentPlayer = players[currentRevealIndex];

  const handleDone = () => {
    if (currentPlayer) {
      markRevealed(currentPlayer.id);
    }
  };

  const handleGoToClues = () => {
    goToClues();
    navigate('/clues');
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header with Progress and Language Toggle */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/lobby')}
            className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
            <span>{strings.nav?.back || 'Back to Lobby'}</span>
          </button>
          <LanguageToggle variant="chip" />
        </div>

        {/* Step progress pills */}
        <div className="flex gap-1.5 w-full">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300
                ${i < currentRevealIndex
                  ? 'bg-red-600'
                  : i === currentRevealIndex
                  ? 'bg-red-500/50'
                  : 'bg-zinc-800'
                }
              `}
            />
          ))}
        </div>

        <p className="text-zinc-500 text-xs text-center font-mono">
          {allRevealed
            ? (strings.reveal?.allViewed || 'All Operatives Cleared')
            : (strings.reveal?.viewedCount
                ?.replace('{current}', currentRevealIndex + 1)
                ?.replace('{total}', players.length) || `Operative ${currentRevealIndex + 1} of ${players.length}`)}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!allRevealed ? (
            <motion.div
              key={`reveal-${currentRevealIndex}`}
              className="w-full"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {currentPlayer && (
                <RoleReveal
                  player={currentPlayer}
                  gameMode={gameMode}
                  onDone={handleDone}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all-done"
              className="text-center space-y-6 w-full max-w-sm mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500">
                <ShieldCheck size={36} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                  {strings.reveal?.everyoneReady || 'All Operatives Ready'}
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line">
                  {strings.reveal?.allSeenDesc?.replace('{n}', players.length) ||
                    `All ${players.length} operatives have reviewed their clearance. Proceed to the discussion and clue round.`}
                </p>
              </div>

              {/* Player roster summary */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-2.5">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider text-center">
                  {strings.reveal?.playersLabel || 'Operative Roster'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1"
                    >
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span className="text-zinc-200 text-xs font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="xl"
                onClick={handleGoToClues}
                icon={MessageSquare}
              >
                {strings.reveal?.startClueRound || 'Start Clue Round'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
