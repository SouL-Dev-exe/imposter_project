/**
 * Timer.jsx — Animated circular countdown timer
 */
import { motion } from 'framer-motion';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer({ seconds, onEnd, running = true, size = 120 }) {
  const { playTick, playAlarm } = useAudio();

  const { timeLeft, progress } = useTimer(
    seconds,
    (t) => {
      if (t <= 5) playTick();
    },
    () => {
      playAlarm();
      onEnd?.();
    },
    running
  );

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <motion.circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#8b5cf6'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          animate={{ stroke: isUrgent ? '#ef4444' : '#8b5cf6' }}
          transition={{ duration: 0.3 }}
          style={{ transition: 'stroke-dashoffset 0.95s linear' }}
        />
        {/* Time label */}
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={isUrgent ? '#ef4444' : 'white'}
          fontSize="22"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {timeLeft}
        </text>
      </svg>
      {isUrgent && (
        <motion.p
          className="text-red-400 text-xs font-bold tracking-widest uppercase"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          Time's up soon!
        </motion.p>
      )}
    </div>
  );
}
