/**
 * Clues.jsx — Discussion round with a shared countdown timer.
 * - Large SVG ring countdown (or "∞" badge for unlimited mode)
 * - Audio alert + pulse animation at timer expiry
 * - Contextual action buttons: local = "Start New Round" only;
 *   online = "Start New Round" + "Finish Round & Vote"
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useGameStore } from '../store/gameStore';
import { usePackStore } from '../store/packStore';
import { useLanguageStore } from '../store/languageStore';
import { useAudio } from '../hooks/useAudio';
import { playTimerEndSound } from '../utils/sfx';
import { assignRoles, pickRandomPair } from '../utils/gameLogic';

// ─── Constants ────────────────────────────────────────────────────────────────
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Large ring countdown display ─────────────────────────────────────────────
function DiscussionTimer({ totalSeconds, onExpire }) {
  const { playAlarm, playTick } = useAudio();
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef(null);

  // Reset when totalSeconds changes (new round)
  useEffect(() => {
    setTimeLeft(totalSeconds);
    setExpired(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (totalSeconds === 0) return; // Unlimited — don't tick
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

  // Format mm:ss
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const display = totalSeconds === 0
    ? '∞'
    : `${mins}:${String(secs).padStart(2, '0')}`;

  const ringColor = isUrgent ? '#ef4444' : expired ? '#ef4444' : '#8b5cf6';
  const ringGlow  = isUrgent ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 20px rgba(139,92,246,0.4)';

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.6, repeat: isUrgent ? Infinity : 0 }}
    >
      <svg
        width={148}
        height={148}
        viewBox="0 0 128 128"
        style={{ filter: `drop-shadow(${ringGlow})` }}
      >
        {/* Background ring */}
        <circle
          cx="64" cy="64" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isUrgent ? '#ef4444' : '#8b5cf6'} />
            <stop offset="100%" stopColor={isUrgent ? '#dc2626' : '#ec4899'} />
          </linearGradient>
        </defs>
        {/* Progress ring */}
        {totalSeconds > 0 && (
          <circle
            cx="64" cy="64" r={RADIUS}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 0.95s linear' }}
          />
        )}
        {/* Unlimited full ring */}
        {totalSeconds === 0 && (
          <circle
            cx="64" cy="64" r={RADIUS}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        {/* Time label */}
        <text
          x="64" y="60"
          textAnchor="middle"
          dominantBaseline="central"
          fill={isUrgent ? '#ef4444' : 'white'}
          fontSize={totalSeconds === 0 ? '34' : display.length > 4 ? '22' : '26'}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {display}
        </text>
        <text
          x="64" y="82"
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.35)"
          fontSize="9"
          fontFamily="sans-serif"
          letterSpacing="1"
        >
          {totalSeconds === 0 ? 'UNLIMITED' : expired ? "TIME'S UP" : 'REMAINING'}
        </text>
      </svg>

      {/* Urgent / expired badge */}
      <AnimatePresence>
        {(isUrgent || expired) && (
          <motion.div
            className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border
              ${expired
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [1, 0.4, 1], scale: 1 }}
            transition={{ duration: 0.7, repeat: Infinity }}
          >
            {expired ? "⏰ Time's Up!" : '⚡ Hurry up!'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Clues() {
  const navigate = useNavigate();
  const {
    players, options, discussionTime,
    goToVote, startGame, selectedCategories,
  } = useGameStore();

  const { customPacks, cloudPacks } = usePackStore();
  const { t, language } = useLanguageStore();
  const strings = t();
  const isArabic = language === 'ar';

  // Detect online mode via multiplayerStore (roomId present = online session)
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    try {
      const mpRaw = localStorage.getItem('undercover-multiplayer');
      if (mpRaw) {
        const mp = JSON.parse(mpRaw);
        setIsOnline(Boolean(mp?.state?.roomId || mp?.state?.roomCode));
      }
    } catch {
      setIsOnline(false);
    }
  }, []);

  // Timer expiry state
  const [expired, setExpired] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const activePlayers = players.filter((p) => !p.isEliminated);
  const totalSeconds = discussionTime ?? 120; // 0 = unlimited

  useEffect(() => {
    if (!players || players.length === 0) navigate('/lobby');
  }, [players, navigate]);

  const handleExpire = useCallback(() => setExpired(true), []);

  const handleGoVote = () => {
    goToVote();
    navigate('/vote');
  };

  const handleNewRound = () => {
    const pair = pickRandomPair(selectedCategories, customPacks, cloudPacks);
    const names = players.map((p) => p.name);
    const newPlayers = assignRoles(names, options.gameMode || 'conscious', options, pair);
    startGame(newPlayers, pair);
    setExpired(false);
    setTimerKey((k) => k + 1);
    navigate('/reveal');
  };

  if (!players || players.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-lg mx-auto gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            {isArabic ? 'مرحلة النقاش' : 'Discussion Phase'}
          </p>
          <h1 className="text-2xl font-black text-white">
            {isArabic ? '💬 النقاش الجماعي' : '💬 Group Discussion'}
          </h1>
        </div>
        <LanguageToggle variant="chip" />
      </div>

      {/* Instruction strip */}
      <motion.div
        className="bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-3 text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-violet-300 text-sm font-medium">
          {isArabic
            ? 'الجميع يتحدثون الآن! شاركوا تلميحاتكم واكتشفوا المخادع.'
            : 'Everyone speaks now! Share your clues and find the Impostor.'}
        </p>
      </motion.div>

      {/* ── Central countdown ring ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        >
          <DiscussionTimer
            key={timerKey}
            totalSeconds={totalSeconds}
            onExpire={handleExpire}
          />
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
            {strings.clues.discussionInProgress || 'Discussion in progress'}
          </p>
        </motion.div>

        {/* Player roster — compact chips, no turn indicator */}
        <motion.div
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-white/30 text-xs uppercase tracking-wider mb-3 text-center">
            {isArabic ? 'اللاعبون' : 'Players'} · {activePlayers.length}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {activePlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-3 py-1.5"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-black">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="text-white/80 text-sm font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Expired alert */}
        <AnimatePresence>
          {expired && (
            <motion.div
              className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-red-400 font-bold text-sm">
                {strings.clues.timerExpired || "Time's up! Move to voting."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action buttons ── */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isOnline ? (
          /* Online: both buttons available */
          <>
            <Button
              variant="primary"
              fullWidth
              size="xl"
              onClick={handleNewRound}
              icon="🔄"
            >
              {strings.clues.startNewRound || 'Start New Round'}
            </Button>
            <Button
              variant="warning"
              fullWidth
              size="lg"
              onClick={handleGoVote}
              icon="🗳️"
            >
              {strings.clues.finishAndVote || 'Finish Round & Vote'}
            </Button>
          </>
        ) : (
          /* Local: start new round is primary, vote is secondary */
          <>
            <Button
              variant="primary"
              fullWidth
              size="xl"
              onClick={handleNewRound}
              icon="🔄"
            >
              {strings.clues.startNewRound || 'Start New Round'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              size="lg"
              onClick={handleGoVote}
              icon="🗳️"
            >
              {strings.clues.finishAndVote || 'Finish Round & Vote'}
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
