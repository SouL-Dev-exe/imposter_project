/**
 * Reveal.jsx — Pass-and-Play role reveal phase.
 * Players take turns viewing their secret role card on the same device.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Top Header with Progress and Language Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/lobby')}
            className="text-white/40 hover:text-white transition-colors text-sm"
          >
            <span className="inline-block rtl:rotate-180">←</span> {strings.nav.back}
          </button>
          <LanguageToggle variant="chip" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1 flex-1">
            {players.map((p, i) => (
              <div
                key={p.id}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500
                  ${i < currentRevealIndex
                    ? 'bg-violet-500'
                    : i === currentRevealIndex
                    ? 'bg-violet-300'
                    : 'bg-white/20'
                  }
                `}
              />
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs text-center">
          {allRevealed
            ? strings.reveal.allViewed
            : strings.reveal.viewedCount
                .replace('{current}', currentRevealIndex + 1)
                .replace('{total}', players.length)}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!allRevealed ? (
            <motion.div
              key={`reveal-${currentRevealIndex}`}
              className="w-full"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-7xl">🎉</div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">{strings.reveal.everyoneReady}</h2>
                <p className="text-white/60 text-sm whitespace-pre-line">
                  {strings.reveal.allSeenDesc.replace('{n}', players.length)}
                </p>
              </div>

              {/* Player roll summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{strings.reveal.playersLabel}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1"
                    >
                      <span className="text-sm">✅</span>
                      <span className="text-white text-sm font-medium">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="xl"
                onClick={handleGoToClues}
                icon="💬"
              >
                {strings.reveal.startClueRound}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
