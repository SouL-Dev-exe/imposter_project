/**
 * RoleReveal.jsx — Secret role card shown to one player at a time.
 * Tap / click toggle to view. Privacy-first design.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';

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
          emoji: strings.roles.impostorEmoji,
          color: 'from-slate-700 to-zinc-800',
          border: 'border-white/20',
          description: strings.roles.impostorDesc,
        };
      case ROLES.MR_WHITE:
        return {
          label: strings.roles.mrWhite,
          emoji: strings.roles.mrWhiteEmoji,
          color: 'from-slate-700 to-zinc-800',
          border: 'border-white/20',
          description: strings.roles.mrWhiteDesc,
        };
      case ROLES.FAKE_IMPOSTOR:
      case 'fake_impostor':
        return {
          label: strings.roles.fake_impostor || strings.roles.fakeImpostor || 'Fake Impostor',
          emoji: strings.roles.fakeImpostorEmoji || '🎭',
          color: 'from-slate-700 to-zinc-800',
          border: 'border-white/20',
          description: strings.roles.fakeImpostorDesc,
        };
      case ROLES.CIVILIAN:
      default:
        return {
          label: strings.roles.civilian,
          emoji: strings.roles.civilianEmoji,
          color: 'from-slate-700 to-zinc-800',
          border: 'border-white/20',
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
      // Blind impostor: sees Word B
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
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Player header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-white/60 text-sm uppercase tracking-widest mb-1">{strings.reveal.nowViewing}</p>
        <h2 className="text-3xl font-bold text-white">{player.name}</h2>
      </motion.div>

      {/* Role card */}
      <motion.div
        className="w-full rounded-2xl border border-white/20 bg-gradient-to-br from-slate-700 to-zinc-800 p-0.5 shadow-2xl cursor-pointer select-none"
        onClick={toggleReveal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleReveal();
          }
        }}
        aria-label={revealed ? (strings.reveal.tapToHide || 'Tap to Hide') : (strings.reveal.tapToReveal || 'Tap to Reveal')}
      >
        <div className="bg-gray-950/80 rounded-2xl p-6 text-center min-h-[220px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            {!revealed ? (
              /* Hidden state */
              <motion.div
                key="hidden"
                className="space-y-4 w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-6xl">🔒</div>
                <p className="text-white/70 text-sm font-medium">
                  {strings.reveal.tapInstruction || strings.reveal.holdInstruction}
                </p>
                <p className="text-white/30 text-xs">{strings.reveal.privacyWarning}</p>
              </motion.div>
            ) : (
              /* Revealed state */
              <motion.div
                key="revealed"
                className="space-y-3 w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              >
                <div className="text-5xl">{cfg.emoji}</div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-widest">{info.label}</p>
                  {info.word ? (
                    <p className="text-4xl font-black text-white mt-1 tracking-tight">{info.word}</p>
                  ) : (
                    <p className="text-2xl font-bold text-white/80 mt-1 italic">{strings.reveal.noWord}</p>
                  )}
                </div>
                <p className="text-white/50 text-sm">{info.sub}</p>
                {info.hint && (
                  <p className="text-amber-400/80 text-sm font-medium">{info.hint}</p>
                )}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white/40 text-xs">{cfg.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="w-full space-y-3">
        {/* Tap to Reveal / Tap to Hide button */}
        <motion.button
          type="button"
          onClick={toggleReveal}
          className={`w-full py-4 rounded-xl font-semibold text-lg cursor-pointer select-none transition-all duration-200 border flex items-center justify-center gap-2 ${
            revealed
              ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white/90 shadow-sm'
              : 'bg-violet-600/30 hover:bg-violet-600/40 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10'
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {revealed
            ? `🔒 ${strings.reveal.tapToHide || 'Tap to Hide'}`
            : `🔓 ${strings.reveal.tapToReveal || strings.reveal.holdToReveal || 'Tap to Reveal'}`
          }
        </motion.button>

        {/* Done / Pass Device button */}
        {hasRevealedOnce && (
          <motion.button
            type="button"
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg cursor-pointer shadow-lg shadow-emerald-600/20 transition-colors"
            onClick={onDone}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
          >
            {strings.reveal.gotItPass}
          </motion.button>
        )}
      </div>
    </div>
  );
}
