/**
 * Result.jsx — Game result screen.
 * Shows the winner, reveals all roles, and handles the impostor final guess flow.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  RotateCcw, 
  Home, 
  Share2, 
  Coins, 
  Eye, 
  Shield, 
  HelpCircle, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  UserX,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FinalGuess } from '../components/game/FinalGuess';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { useAudio } from '../hooks/useAudio';
import { ROLES } from '../utils/gameLogic';
import { useEconomyStore } from '../store/economyStore';
import MatchRewardsModal from '../components/economy/MatchRewardsModal';
import { VictoryModal } from '../components/game/VictoryModal';
import { MatchShareCard } from '../components/game/MatchShareCard';
import { UserAvatar } from '../components/ui/UserAvatar';
import { ScreenFXOverlay } from '../components/ui/ScreenFXOverlay';
import { getStoreItem } from '../data/economyCatalog';
import { toast } from '../store/toastStore';
import { vibrate, playVictorySound, playCoinSound } from '../utils/sfx';
import { useMultiplayerStore } from '../store/multiplayerStore';

const spring = { type: 'spring', stiffness: 450, damping: 28 };

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFinalGuessPhase = searchParams.get('phase') === 'final_guess';
  const { t } = useLanguageStore();

  const {
    players, winner, eliminatedPlayer, wordPair, gameMode,
    setFinalGuessResult, setWinner, resetToLobby, resetGame,
  } = useGameStore();

  const { playWin, playLose } = useAudio();
  const [showFinalGuess, setShowFinalGuess] = useState(isFinalGuessPhase);
  const [finalGuessResolved, setFinalGuessResolved] = useState(false);
  const [revealRoles, setRevealRoles] = useState(false);

  const ROLE_CONFIGS = {
    [ROLES.CIVILIAN]: { label: t('roles.civilian') || 'Civilian', icon: Shield, color: 'text-zinc-200' },
    [ROLES.IMPOSTOR]: { label: t('roles.impostor') || 'Impostor', icon: Eye, color: 'text-red-400' },
    [ROLES.MR_WHITE]: { label: t('roles.mrWhite') || 'Mr. White', icon: HelpCircle, color: 'text-zinc-400' },
    [ROLES.FAKE_IMPOSTOR]: { label: t('roles.fake_impostor') || 'Decoy Operative', icon: Layers, color: 'text-amber-400' },
  };

  const [rewardBreakdown, setRewardBreakdown] = useState(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const recordMatchOutcome = useEconomyStore((s) => s.recordMatchOutcome);
  const globalEquipped = useEconomyStore((s) => s.equipped);
  const roomCode = useMultiplayerStore((s) => s.roomCode) || 'PARTY';

  const undercoverPlayer = (players || []).find((p) => p.role === 'impostor' || p.role === 'mrwhite');
  const foolPlayer = (players || []).find((p) => p.role === 'fake_impostor' || p.role === ROLES.FAKE_IMPOSTOR);
  const mvpPlayer = (winner === 'civilians' ? (players || []).find((p) => p.role === 'civilian' && !p.isEliminated) : undercoverPlayer) || players?.[0];

  useEffect(() => {
    if (!players || players.length === 0) {
      navigate('/');
      return;
    }

    if (winner === 'civilians') {
      setTimeout(() => playWin(), 300);
      setShowVictoryModal(true);
    } else if (winner === 'impostors' || winner === 'fake_impostor') {
      setTimeout(() => playLose(), 300);
      setShowVictoryModal(true);
    }

    if (winner && !showFinalGuess && !rewardBreakdown) {
      const isVictory = winner === 'civilians' || winner === 'impostors';
      const isImpostor = winner === 'impostors';
      const isCorrectVote = winner === 'civilians';

      const res = recordMatchOutcome({
        isVictory,
        isCorrectVote,
        isImpostor,
      });

      setRewardBreakdown(res);
      setShowRewardsModal(true);

      vibrate([100, 50, 100]);
      if (isVictory) {
        playVictorySound();
      } else {
        playCoinSound();
      }

      if (res.totalSC > 0) {
        toast.coin(res.totalSC, isVictory ? 'Victory Rewards' : 'Match Rewards');
      }

      if (res.leveledUp) {
        setTimeout(() => {
          toast.levelUp(res.newLevel);
        }, 600);
      }
    }
  }, [winner, showFinalGuess]);

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

  const winnerInfo = {
    civilians: {
      icon: Shield,
      title: t('result.civiliansWin') || 'Civilians Victorious',
      subtitle: t('result.civiliansSubtitle') || 'Infiltrator eliminated by consensus.',
      badgeColor: 'border-zinc-700 bg-zinc-900',
    },
    impostors: {
      icon: Trophy,
      title: t('result.impostorWins') || 'Impostor Victory',
      subtitle: t('result.impostorSubtitle') || 'Cover intact. Deception successful.',
      badgeColor: 'border-red-600/60 bg-red-950/30',
    },
  };

  const info = winner ? winnerInfo[winner] : null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4 font-sans selection:bg-red-600 selection:text-white">
      {/* Top action bar */}
      <div className="flex justify-end">
        <LanguageToggle variant="chip" />
      </div>

      {/* Final Guess Phase */}
      {isFinalGuessPhase && !finalGuessResolved && (
        <AnimatePresence>
          {showFinalGuess && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
              <motion.div
                className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl p-6 pb-10"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={spring}
              >
                <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
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

      {/* Decoy Operative (Fake Impostor) Victory Banner */}
      {winner === 'fake_impostor' && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-center mb-2">
          <Layers size={36} className="mx-auto mb-2 text-amber-400" />
          <h2 className="text-xl font-bold text-amber-400">
            {t('result.fakeImpostorWin') || 'Decoy Operative Wins!'}
          </h2>
          <p className="text-xs text-zinc-300 mt-1">
            {t('result.fakeImpostorWinDesc') || 'Successfully deceived the group into voting them out!'}
          </p>
        </div>
      )}

      {/* Winner reveal card */}
      {winner && winner !== 'fake_impostor' && info && (
        <motion.div
          className={`rounded-2xl border ${info.badgeColor} p-6 text-center space-y-3 relative overflow-hidden`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
        >
          <ScreenFXOverlay />
          <div className="flex justify-center my-1">
            <UserAvatar size="xl" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-red-500">
            <Trophy size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{info.title}</h1>
            <p className="text-zinc-400 text-xs mt-0.5">{info.subtitle}</p>
          </div>

          {globalEquipped?.title && (
            <div className="pt-1 flex justify-center">
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-200 flex items-center gap-1.5 uppercase">
                <Trophy size={12} className="text-amber-400" />
                <span>[{getStoreItem(globalEquipped.title)?.name || globalEquipped.title}]</span>
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Secret Word reveal */}
      {wordPair && (
        <motion.div
          className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-center space-y-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{t('result.secretWords') || 'Secret Cipher Words'}</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-zinc-500 text-xs mb-1 font-mono">{t('result.civilians') || 'Civilians'}</p>
              <p className="text-xl font-bold text-white">{wordPair.wordA}</p>
            </div>
            <div className="text-zinc-700 text-sm font-mono">VS</div>
            <div className="text-center">
              <p className="text-zinc-500 text-xs mb-1 font-mono">{t('result.impostor') || 'Impostor'}</p>
              <p className="text-xl font-bold text-red-400">
                {gameMode === 'blind' ? wordPair.wordB : (t('result.none') || 'None (Bluff)')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Role list toggle */}
      <motion.div
        className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          type="button"
          onClick={() => setRevealRoles(!revealRoles)}
          className="w-full p-4 flex items-center justify-between text-start text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Eye size={15} className="text-red-500" />
            <span>{revealRoles ? t('result.hideRoles') : t('result.revealRoles')}</span>
          </span>
          {revealRoles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {revealRoles && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4 space-y-2 border-t border-zinc-900"
            >
              {(players || []).map((p, i) => {
                const roleCfg = ROLE_CONFIGS[p.role] || ROLE_CONFIGS[ROLES.CIVILIAN];
                const RoleIcon = roleCfg.icon;
                const titleId = p.equipped?.title || 'title_novice';
                const titleItem = getStoreItem(titleId) || { name: 'Novice', accent: '#dc2626' };
                const playerName = p.username || p.name;

                return (
                  <motion.div
                    key={p.id || playerName}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <UserAvatar
                      username={playerName}
                      avatarUrl={p.avatar_url}
                      equipped={p.equipped}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0 text-start">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-semibold text-xs truncate">{playerName}</p>
                        <span
                          className="text-[9px] font-mono px-1 rounded uppercase font-bold"
                          style={{
                            color: titleItem.accent || '#f87171',
                            backgroundColor: `${titleItem.accent || '#dc2626'}15`,
                          }}
                        >
                          [{titleItem.name}]
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <RoleIcon size={12} className={roleCfg.color} />
                        <span className={`text-[11px] font-mono ${roleCfg.color}`}>{roleCfg.label}</span>
                      </div>
                    </div>
                    <div className="text-end font-mono text-xs text-zinc-400">
                      {p.role === ROLES.IMPOSTOR && gameMode === 'blind'
                        ? wordPair?.wordB
                        : p.role === ROLES.CIVILIAN
                        ? wordPair?.wordA
                        : p.role === ROLES.FAKE_IMPOSTOR || p.role === 'fake_impostor'
                        ? wordPair?.wordB
                        : '—'}
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
        className="space-y-2.5 pt-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {rewardBreakdown && (
          <button
            type="button"
            onClick={() => setShowRewardsModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-amber-400" />
              <span>{t('rewards.title')}: +{rewardBreakdown.totalSC} SC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-mono">+{rewardBreakdown.xpGained} XP</span>
              <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-bold font-mono">
                {t('victory.close') === 'Dismiss Intel' ? 'View' : 'عرض'}
              </span>
            </div>
          </button>
        )}

        {/* Share Story Card Button */}
        <button
          type="button"
          onClick={() => setShowShareCard(true)}
          className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Share2 size={15} className="text-red-500" />
          <span>{t('share.shareStory')}</span>
        </button>

        <Button variant="primary" fullWidth size="xl" onClick={handlePlayAgain} icon={RotateCcw}>
          {t('result.playAgain')}
        </Button>

        <Button variant="ghost" fullWidth size="md" onClick={handleHome} icon={Home}>
          {t('result.home')}
        </Button>
      </motion.div>

      {/* Match Rewards Modal */}
      <MatchRewardsModal
        isOpen={showRewardsModal}
        breakdown={rewardBreakdown}
        onClose={() => setShowRewardsModal(false)}
      />

      {/* Victory Showcase Spotlight Modal */}
      <VictoryModal
        isOpen={showVictoryModal}
        winner={winner}
        wordPair={wordPair}
        onClose={() => setShowVictoryModal(false)}
      />

      {/* Match MVP & Story Share Card */}
      {showShareCard && (
        <MatchShareCard
          mvpName={mvpPlayer?.name || mvpPlayer?.username}
          undercoverName={undercoverPlayer?.name || undercoverPlayer?.username}
          foolName={foolPlayer?.name || foolPlayer?.username}
          roomCode={roomCode}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
}
