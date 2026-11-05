/**
 * HudFrame.jsx — Minimal tactical HUD primitives (optional, used sparingly)
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Corner bracket accents — use on game role cards only, not UI modals
 */
export function Corners({
  size = 'w-3 h-3',
  thick = 'border',
  color = 'border-zinc-700',
  className = '',
}) {
  return (
    <>
      <span aria-hidden className={`pointer-events-none absolute top-0 left-0 ${size} ${thick} ${color} border-r-0 border-b-0 ${className}`} />
      <span aria-hidden className={`pointer-events-none absolute top-0 right-0 ${size} ${thick} ${color} border-l-0 border-b-0 ${className}`} />
      <span aria-hidden className={`pointer-events-none absolute bottom-0 left-0 ${size} ${thick} ${color} border-r-0 border-t-0 ${className}`} />
      <span aria-hidden className={`pointer-events-none absolute bottom-0 right-0 ${size} ${thick} ${color} border-l-0 border-t-0 ${className}`} />
    </>
  );
}

/**
 * Status pill tag — small rounded badge
 * tone: 'red' | 'white' | 'muted' | 'amber'
 */
export function ClassifiedTag({ children, tone = 'red', className = '' }) {
  const toneMap = {
    red: 'bg-red-950/60 text-red-400 border-red-900/60',
    white: 'bg-zinc-100 text-zinc-900 border-zinc-200 font-semibold',
    muted: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-900/60',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide border rounded-sm ${toneMap[tone] ?? toneMap.red} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Pulsing ring — for role cards to draw focus
 */
export function PulseRing({ className = '' }) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute inset-0 border border-red-600/30 rounded-full ${className}`}
      animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/**
 * Ambient floating particles — only for VictoryModal
 */
export function Particles({ count = 10, className = '' }) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 11.3 + 8) % 100}%`,
      top: `${(i * 15.7 + 5) % 100}%`,
      duration: 2.5 + (i % 3),
      delay: (i * 0.35) % 1.8,
    }));
  }, [count]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute w-1 h-1 rounded-full bg-red-500/50"
          style={{ left: d.left, top: d.top }}
          animate={{ y: [-12, 12, -12], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default { Corners, ClassifiedTag, PulseRing, Particles };
