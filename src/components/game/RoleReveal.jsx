/**
 * RoleReveal.jsx — Secret role card shown to one player at a time.
 * Requires holding a button to view. Privacy-first design.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';

export function RoleReveal({ player, gameMode, onDone }) {
  const [holding, setHolding] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const { playReveal } = useAudio();
  const { t } = useLanguageStore();
  const strings = t();
  const intervalRef = useState(null);

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

  const handleHoldStart = useCallback(() => {
    setHolding(true);
    let progress = 0;
    intervalRef[0] = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(intervalRef[0]);
        setRevealed(true);
        playReveal();
      }
    }, 30);
  }, [playReveal]);

  const handleHoldEnd = useCallback(() => {
    if (!revealed) {
      setHolding(false);
      setHoldProgress(0);
      clearInterval(intervalRef[0]);
    }
  }, [revealed]);

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
        className="w-full rounded-2xl border border-white/20 bg-gradient-to-br from-slate-700 to-zinc-800 p-0.5 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-gray-950/80 rounded-2xl p-6 text-center space-y-4">
          <AnimatePresence mode="wait">
            {!revealed ? (
              /* Hidden state */
              <motion.div
                key="hidden"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-6xl">🔒</div>
                <p className="text-white/50 text-sm">{strings.reveal.holdInstruction}</p>
                <p className="text-white/30 text-xs">{strings.reveal.privacyWarning}</p>
              </motion.div>
            ) : (
              /* Revealed state */
              <motion.div
                key="revealed"
                className="space-y-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
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

      {/* Hold-to-reveal button */}
      {!revealed ? (
        <div className="w-full space-y-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              style={{ width: `${holdProgress}%` }}
            />
          </div>
          <motion.button
            className="w-full py-4 rounded-xl bg-violet-600/30 border border-violet-500/50 text-violet-300 font-semibold text-lg select-none touch-none cursor-pointer"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            whileTap={{ scale: 0.97 }}
          >
            {holding ? `👁️ ${strings.reveal.revealing}` : `🔒 ${strings.reveal.holdToReveal}`}
          </motion.button>
        </div>
      ) : (
        <motion.button
          className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg cursor-pointer"
          onClick={onDone}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          transition={{ delay: 0.5 }}
        >
          {strings.reveal.gotItPass}
        </motion.button>
      )}
    </div>
  );
}
