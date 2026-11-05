/**
 * Clues.jsx — Discussion round with a shared countdown timer.
 * Premium tactical styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Vote, 
  Timer, 
  Infinity as InfinityIcon, 
  MessageSquare, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { usePackStore } from '../store/packStore';
import { useLanguageStore } from '../store/languageStore';
import { useAudio } from '../hooks/useAudio';
import { playTimerEndSound } from '../utils/sfx';
import { assignRoles, pickRandomPair } from '../utils/gameLogic';
import { ScreenFXOverlay } from '../components/ui/ScreenFXOverlay';
import { EmoteWheel } from '../components/game/EmoteWheel';
import { UserAvatar } from '../components/ui/UserAvatar';
import { getStoreItem } from '../data/economyCatalog';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Large ring countdown display ─────────────────────────────────────────────
function DiscussionTimer({ totalSeconds, onExpire }) {
  const { playAlarm, playTick } = useAudio();
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setExpired(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (totalSeconds === 0) return; // Unlimited
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setExpired(true);
          playAlarm();
          playTimerEndSound();
          onExpire?.();
          return 0;
        }
        if (prev <= 6) playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [totalSeconds, onExpire, playAlarm, playTick]);

  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = totalSeconds > 0 && timeLeft <= 10;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = totalSeconds === 0
    ? '∞'
    : `${mins}:${String(secs).padStart(2, '0')}`;

  const ringStroke = isUrgent || expired ? '#ef4444' : '#dc2626';

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.6, repeat: isUrgent ? Infinity : 0 }}
    >
      <svg
        width={140}
        height={140}
        viewBox="0 0 128 128"
        className="select-none"
      >
        {/* Background track */}
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />

        {/* Progress ring */}
        {totalSeconds > 0 && (
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={ringStroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 64 64)"
            className="transition-all duration-300 ease-linear"
          />
        )}

        {/* Center label */}
        <text
          x="64"
          y="68"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-mono font-black"
          fontSize={totalSeconds === 0 ? '42' : '26'}
          letterSpacing="-0.02em"
        >
          {display}
        </text>
      </svg>
    </motion.div>
  );
}

export default function Clues() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguageStore();
  const strings = t();
  const isArabic = useLanguageStore((s) => s.language) === 'ar';

  const {
    players, currentRound, discussionTime,
    setPhase, setPlayers, setWordPair, gameMode, options, selectedCategories,
  } = useGameStore();

  const { customPacks, cloudPacks } = usePackStore();

  const [expired, setExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const activePlayers = (players || []).filter((p) => !p.isEliminated);
  const totalSeconds = discussionTime ?? 120;
  const isOnline = false;

  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  const handleExpire = () => setExpired(true);

  const handleNewRound = () => {
    const pair = pickRandomPair(selectedCategories, customPacks, cloudPacks);
    const activeNames = activePlayers.map((p) => p.name || p.username);
    const freshPlayers = assignRoles(activeNames, gameMode, options, pair);
    setPlayers(freshPlayers);
    setWordPair(pair);
    setPhase('reveal');
    navigate('/reveal');
  };

  const handleGoVote = () => {
    setPhase('vote');
    navigate('/vote');
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
            onClick={() => navigate('/lobby')}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
            title={strings.nav?.back || 'Back'}
          >
            <ArrowLeft size={18} className="rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {strings.clues?.title || 'Tactical Debrief'}
            </h1>
            <p className="text-zinc-500 text-xs font-mono">
              {strings.clues?.roundLabel?.replace('{n}', currentRound || 1) || `Round ${currentRound || 1}`}
            </p>
          </div>
        </div>
        <LanguageToggle variant="chip" />
      </div>

      {/* Mission prompt */}
      <motion.div
        className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 text-center z-10"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-zinc-300 font-medium">
          {strings.clues?.instructions || 'Take turns giving a one-word clue related to your secret word. Expose the impostor.'}
        </p>
      </motion.div>

      {/* Central countdown ring */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 z-10 py-2">
        <div className="flex flex-col items-center gap-1.5">
          <DiscussionTimer
            key={timerKey}
            totalSeconds={totalSeconds}
            onExpire={handleExpire}
          />
          <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">
            {strings.clues?.discussionInProgress || 'Discussion in progress'}
          </p>
        </div>

        {/* Player roster chips */}
        <motion.div
          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 space-y-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-red-500" />
              <span>{isArabic ? 'اللاعبون' : 'Active Operatives'}</span>
            </span>
            <span className="text-zinc-500">{activePlayers.length} in play</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {activePlayers.map((p) => {
              const titleId = p.equipped?.title || 'title_novice';
              const titleItem = getStoreItem(titleId) || { name: 'Novice', accent: '#dc2626' };
              const playerName = p.username || p.name;

              return (
                <div
                  key={p.id || playerName}
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs"
                >
                  <UserAvatar
                    username={playerName}
                    avatarUrl={p.avatar_url}
                    equipped={p.equipped}
                    size="xs"
                  />
                  <span className="text-zinc-100 font-semibold">{playerName}</span>
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
              );
            })}
          </div>
        </motion.div>

        {/* Expired alert */}
        <AnimatePresence>
          {expired && (
            <motion.div
              className="w-full bg-red-950/30 border border-red-900/50 rounded-xl p-3 text-center flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-red-400 font-semibold text-xs font-mono">
                {strings.clues?.timerExpired || "Time's up! Proceed to voting."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <motion.div
        className="space-y-2.5 z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Button
          variant="primary"
          fullWidth
          size="xl"
          onClick={handleGoVote}
          icon={Vote}
        >
          {strings.clues?.finishAndVote || 'Commence Voting'}
        </Button>

        <Button
          variant="secondary"
          fullWidth
          size="md"
          onClick={handleNewRound}
          icon={RotateCcw}
        >
          {strings.clues?.startNewRound || 'Start New Round'}
        </Button>
      </motion.div>
    </div>
  );
}
