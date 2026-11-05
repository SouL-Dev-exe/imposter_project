/**
 * Timer.jsx — Minimal tactical countdown timer
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
    <div className="flex flex-col items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={isUrgent ? '#dc2626' : '#ffffff'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          animate={{ stroke: isUrgent ? '#dc2626' : '#ffffff' }}
          transition={{ duration: 0.2 }}
          style={{ transition: 'stroke-dashoffset 0.95s linear' }}
        />
        {/* Time label */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={isUrgent ? '#ef4444' : '#ffffff'}
          fontSize="22"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
        >
          {timeLeft}
        </text>
      </svg>
      {isUrgent && (
        <motion.p
          className="text-red-500 text-[10px] font-mono font-semibold tracking-wider uppercase"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          Critical Countdown
        </motion.p>
      )}
    </div>
  );
}

export default Timer;
