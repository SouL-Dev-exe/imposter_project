/**
 * RoleReveal.jsx — Pass-and-Play secret role reveal component.
 * Premium tactical styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Check, 
  Shield, 
  Eye, 
  HelpCircle, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { ROLES } from '../../utils/gameLogic';
import { useAudio } from '../../hooks/useAudio';
import { useLanguageStore } from '../../store/languageStore';
import { Button } from '../ui/Button';

const spring = { type: 'spring', stiffness: 450, damping: 28 };

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
          label: strings.roles?.impostor || 'Impostor',
          icon: Eye,
          badgeText: 'HOSTILE INFILTRATOR',
          border: 'border-red-600/70',
          badgeColor: 'bg-red-600 text-white',
          description: strings.roles?.impostorDesc || 'You are undercover. Blend in with civilians and deduce their word.',
        };
      case ROLES.MR_WHITE:
        return {
          label: strings.roles?.mrWhite || 'Mr. White',
          icon: HelpCircle,
          badgeText: 'UNKNOWN CIPHER',
          border: 'border-zinc-500/70',
          badgeColor: 'bg-zinc-200 text-black',
          description: strings.roles?.mrWhiteDesc || 'You have no word. Guess the secret word to win.',
        };
      case ROLES.FAKE_IMPOSTOR:
      case 'fake_impostor':
        return {
          label: strings.roles?.fake_impostor || strings.roles?.fakeImpostor || 'Decoy Operative',
          icon: Layers,
          badgeText: 'DECOY ASSET',
          border: 'border-amber-500/70',
          badgeColor: 'bg-amber-500 text-black',
          description: strings.roles?.fakeImpostorDesc || 'You want to be voted out. Deceive players to eliminate you.',
        };
      case ROLES.CIVILIAN:
      default:
        return {
          label: strings.roles?.civilian || 'Civilian',
          icon: Shield,
          badgeText: 'CLEARANCE LEVEL 1 // AGENT',
          border: 'border-zinc-700',
          badgeColor: 'bg-zinc-800 text-zinc-100',
          description: strings.roles?.civilianDesc || 'Find the impostor among you. Do not reveal your word directly.',
        };
    }
  };

  const cfg = getRoleConfig();
  const RoleIcon = cfg.icon;

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
        label: strings.reveal?.secretWord || 'Secret Word',
        word: player.word,
        sub: strings.reveal?.categoryPrefix?.replace('{category}', player.category) || `Category: ${player.category}`,
      };
    }
    if (player.role === ROLES.IMPOSTOR) {
      if (gameMode === 'conscious') {
        return {
          label: strings.roles?.impostor || 'Impostor',
          word: null,
          sub: strings.reveal?.categoryHintPrefix?.replace('{category}', player.category) || `Category: ${player.category}`,
          hint: strings.reveal?.bluffHint || 'You have no word. Bluff during discussion!',
        };
      }
      return {
        label: strings.reveal?.secretWord || 'Secret Word',
        word: player.word,
        sub: strings.reveal?.categoryPrefix?.replace('{category}', player.category) || `Category: ${player.category}`,
      };
    }
    if (player.role === ROLES.MR_WHITE) {
      return {
        label: strings.roles?.mrWhite || 'Mr. White',
        word: null,
        sub: strings.reveal?.categoryPrefix?.replace('{category}', player.category) || `Category: ${player.category}`,
        hint: strings.reveal?.mrWhiteHint || 'Listen carefully to clues and guess the secret word!',
      };
    }
    if (player.role === ROLES.FAKE_IMPOSTOR || player.role === 'fake_impostor') {
      return {
        label: strings.roles?.fake_impostor || strings.roles?.fakeImpostor || 'Decoy Operative',
        word: player.word,
        sub: strings.reveal?.categoryPrefix?.replace('{category}', player.category) || `Category: ${player.category}`,
        hint: strings.roles?.fakeImpostorDesc || 'Make others vote for you to win!',
      };
    }
  };

  const info = getWordDisplay();

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto font-sans">
      {/* Player header */}
      <motion.div
        className="text-center space-y-1.5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-zinc-800 bg-zinc-900 rounded-full text-zinc-400 text-xs font-mono uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {strings.reveal?.nowViewing || 'Pass Device to'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {player.name}
        </h2>
      </motion.div>

      {/* Role card */}
      <motion.div
        className={`w-full rounded-2xl border ${cfg.border} bg-zinc-950 p-6 text-center min-h-[280px] flex flex-col justify-center items-center relative overflow-hidden transition-colors shadow-sm`}
        layout
        transition={spring}
      >
        <AnimatePresence mode="wait">
          {!revealed ? (
            /* Hidden / Encrypted state */
            <motion.div
              key="hidden"
              className="space-y-4 w-full flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Lock size={28} />
              </div>

              <div>
                <span className="text-xs font-mono uppercase font-semibold tracking-wider text-zinc-300">
                  {t('reveal.covertClearance')}
                </span>
                <p className="text-zinc-500 text-xs mt-1">
                  {t('reveal.tapInstruction')}
                </p>
              </div>

              <div className="px-3 py-1.5 bg-red-950/20 border border-red-900/30 rounded-lg">
                <p className="text-[11px] text-red-400 font-mono">
                  {t('reveal.privacyWarning')}
                </p>
              </div>
            </motion.div>
          ) : (
            /* Revealed state */
            <motion.div
              key="revealed"
              className="space-y-4 w-full flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={spring}
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
                <RoleIcon size={32} />
              </div>

              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded ${cfg.badgeColor}`}>
                {cfg.badgeText}
              </span>

              <div className="w-full py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                <p className="text-zinc-500 text-xs font-mono uppercase">
                  {info.label}
                </p>
                {info.word ? (
                  <p className="text-3xl font-black text-white mt-1 tracking-tight">
                    {info.word}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-red-400 mt-1 uppercase font-mono">
                    {t('reveal.noWord')}
                  </p>
                )}
              </div>

              <p className="text-zinc-400 text-xs font-medium">{info.sub}</p>

              {info.hint && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg px-3 py-2 text-amber-300 text-xs flex items-center gap-2 text-start">
                  <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                  <span>{info.hint}</span>
                </div>
              )}

              <div className="border-t border-zinc-900 pt-3 w-full">
                <p className="text-zinc-500 text-[11px] leading-relaxed">{cfg.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons */}
      <div className="w-full space-y-2.5">
        <Button
          variant={revealed ? 'secondary' : 'primary'}
          fullWidth
          size="lg"
          onClick={toggleReveal}
          icon={revealed ? Lock : Unlock}
        >
          {revealed
            ? (strings.reveal?.tapToHide || 'Conceal Role')
            : (strings.reveal?.tapToReveal || strings.reveal?.holdToReveal || 'Reveal Role')}
        </Button>

        {hasRevealedOnce && (
          <Button
            variant="danger"
            fullWidth
            size="lg"
            onClick={onDone}
            icon={Check}
          >
            {strings.reveal?.gotItPass || 'Confirm & Pass Device'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoleReveal;
