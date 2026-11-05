/**
 * RoleReveal.jsx — Classified Dossier Secret Role Card
 * Classified Intelligence theme with absolute Black canvas, Red laser borders, and smooth spring animations.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';
import { Button } from '../ui/Button';

export function RoleReveal({ player, gameMode, onDone }) {
  const [revealed, setRevealed] = useState(false);
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
  const { playReveal } = useAudio();
  const { t } = useLanguageStore();
  const strings = t();

  const getRoleConfig = () => {
    switch (player.role) {
      case ROLES.IMPOSTOR:
        return {
          label: strings.roles.impostor,
          emoji: '🕵️‍♂️',
          badgeText: 'HOSTILE INFILTRATOR',
          border: 'border-red-600',
          glow: 'shadow-[0_0_30px_rgba(220,38,38,0.5)]',
          badgeColor: 'bg-red-600 text-black',
          description: strings.roles.impostorDesc,
        };
      case ROLES.MR_WHITE:
        return {
          label: strings.roles.mrWhite,
          emoji: '🕶️',
          badgeText: 'UNKNOWN CIPHER',
          border: 'border-zinc-300',
          glow: 'shadow-[0_0_30px_rgba(255,255,255,0.3)]',
          badgeColor: 'bg-zinc-100 text-black',
          description: strings.roles.mrWhiteDesc,
        };
      case ROLES.FAKE_IMPOSTOR:
      case 'fake_impostor':
        return {
          label: strings.roles.fake_impostor || strings.roles.fakeImpostor || 'Fake Impostor',
          emoji: '🎭',
          badgeText: 'DECOY ASSET',
          border: 'border-amber-500',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
          badgeColor: 'bg-amber-500 text-black',
          description: strings.roles.fakeImpostorDesc,
        };
      case ROLES.CIVILIAN:
      default:
        return {
          label: strings.roles.civilian,
          emoji: '🛡️',
          badgeText: 'CLEARANCE LEVEL 1 // AGENT',
          border: 'border-zinc-700',
          glow: 'shadow-[0_0_25px_rgba(220,38,38,0.2)]',
          badgeColor: 'bg-zinc-800 text-zinc-100',
          description: strings.roles.civilianDesc,
        };
    }
  };

  const cfg = getRoleConfig();

  const toggleReveal = useCallback(() => {
    setRevealed((prev) => {
      const next = !prev;
      if (next) {
        playReveal();
        setHasRevealedOnce(true);
      }
      return next;
    });
  }, [playReveal]);

  const getWordDisplay = () => {
    if (player.role === ROLES.CIVILIAN) {
      return {
        label: strings.reveal.secretWord,
        word: player.word,
        sub: strings.reveal.categoryPrefix.replace('{category}', player.category),
      };
    }
    if (player.role === ROLES.IMPOSTOR) {
      if (gameMode === 'conscious') {
        return {
          label: strings.roles.impostor,
          word: null,
          sub: strings.reveal.categoryHintPrefix.replace('{category}', player.category),
          hint: strings.reveal.bluffHint,
        };
      }
      return {
        label: strings.reveal.secretWord,
        word: player.word,
        sub: strings.reveal.categoryPrefix.replace('{category}', player.category),
      };
    }
    if (player.role === ROLES.MR_WHITE) {
      return {
        label: strings.roles.mrWhite,
        word: null,
        sub: strings.reveal.categoryPrefix.replace('{category}', player.category),
        hint: strings.reveal.mrWhiteHint,
      };
    }
    if (player.role === ROLES.FAKE_IMPOSTOR || player.role === 'fake_impostor') {
      return {
        label: strings.roles.fake_impostor || strings.roles.fakeImpostor || 'Fake Impostor',
        word: player.word,
        sub: strings.reveal.categoryPrefix.replace('{category}', player.category),
        hint: strings.roles.fakeImpostorDesc,
      };
    }
  };

  const info = getWordDisplay();

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto font-mono">
      {/* Player header */}
      <motion.div
        className="text-center space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-red-900/60 bg-red-950/40 text-red-400 text-[10px] uppercase font-bold tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          {strings.reveal.nowViewing}
        </div>
        <h2 className="text-3xl font-black text-white tracking-wider uppercase mt-1">
          {player.name}
        </h2>
      </motion.div>

      {/* Role card dossier */}
      <motion.div
        className={`w-full rounded-sm border bg-zinc-950 p-1 relative select-none cursor-pointer transition-all duration-300 ${
          revealed ? `${cfg.border} ${cfg.glow}` : 'border-zinc-800 hover:border-zinc-600'
        }`}
        onClick={toggleReveal}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleReveal();
          }
        }}
        aria-label={revealed ? strings.reveal.tapToHide : strings.reveal.tapToReveal}
      >
        {/* Reticle Corner Accents */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-600 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-600 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-600 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-600 pointer-events-none" />

        <div className="bg-black/90 p-6 text-center min-h-[260px] flex flex-col justify-center items-center relative overflow-hidden border border-zinc-900">
          <AnimatePresence mode="wait">
            {!revealed ? (
              /* Hidden Locked state */
              <motion.div
                key="hidden"
                className="space-y-4 w-full flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <div className="w-16 h-16 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-3xl shadow-inner">
                    🔒
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 animate-ping rounded-full" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-zinc-300">
                    TOP SECRET ENCRYPTION
                  </span>
                  <p className="text-zinc-500 text-xs mt-1">
                    {strings.reveal.tapInstruction || strings.reveal.holdInstruction}
                  </p>
                </div>
                <div className="px-2 py-1 bg-red-950/20 border border-red-900/30">
                  <p className="text-[10px] text-red-400 font-bold tracking-wider uppercase">
                    {strings.reveal.privacyWarning}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Revealed Classified state */
              <motion.div
                key="revealed"
                className="space-y-3.5 w-full flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              >
                <div className="text-5xl drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  {cfg.emoji}
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${cfg.badgeColor}`}>
                  {cfg.badgeText}
                </span>

                <div className="w-full py-2 bg-zinc-950 border-y border-zinc-900">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
                    {info.label}
                  </p>
                  {info.word ? (
                    <p className="text-3xl font-black text-white mt-1 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {info.word}
                    </p>
                  ) : (
                    <p className="text-2xl font-black text-red-500 mt-1 uppercase tracking-widest animate-pulse">
                      NO WORD // BLUFF
                    </p>
                  )}
                </div>

                <p className="text-zinc-400 text-xs font-semibold">{info.sub}</p>

                {info.hint && (
                  <div className="bg-amber-950/30 border border-amber-800/40 px-3 py-1.5 text-amber-300 text-xs font-bold">
                    ⚠️ {info.hint}
                  </div>
                )}

                <div className="border-t border-zinc-900 pt-3 w-full">
                  <p className="text-zinc-500 text-[10px] leading-relaxed">{cfg.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="w-full space-y-2.5">
        <Button
          variant={revealed ? 'secondary' : 'primary'}
          fullWidth
          size="lg"
          onClick={toggleReveal}
          icon={revealed ? '🔒' : '🔓'}
        >
          {revealed
            ? (strings.reveal.tapToHide || 'CONCEAL DOSSIER')
            : (strings.reveal.tapToReveal || strings.reveal.holdToReveal || 'DECRYPT DOSSIER')}
        </Button>

        {hasRevealedOnce && (
          <Button
            variant="danger"
            fullWidth
            size="lg"
            onClick={onDone}
            icon="✓"
          >
            {strings.reveal.gotItPass}
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoleReveal;
