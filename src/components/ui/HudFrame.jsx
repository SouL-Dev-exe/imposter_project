/**
 * HudFrame.jsx — Tactical Intelligence HUD Frame Primitives
 * Reusable reticles, classified tags, radar pulse rings, and ambient particles.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Tactical Reticle Viewfinder Corners
 * @param {string} size - Tailwind width/height class, default "w-3 h-3"
 * @param {string} thick - Tailwind border thickness, default "border-2"
 * @param {string} color - Tailwind border color, default "border-red-600"
 */
export function Corners({
  size = 'w-3 h-3',
  thick = 'border-2',
  color = 'border-red-600',
  className = '',
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 ${size} ${thick} ${color} border-r-0 border-b-0 ${className}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 ${size} ${thick} ${color} border-l-0 border-b-0 ${className}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 left-0 ${size} ${thick} ${color} border-r-0 border-t-0 ${className}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 right-0 ${size} ${thick} ${color} border-l-0 border-t-0 ${className}`}
      />
    </>
  );
}

/**
 * Classified Status Pill / Tag
 * @param {'red' | 'white' | 'muted'} tone - Theme styling
 */
export function ClassifiedTag({
  children,
  tone = 'red',
  className = '',
}) {
  const toneClasses = {
    red: 'bg-red-950/60 text-red-400 border-red-900/80 shadow-[0_0_10px_rgba(220,38,38,0.25)]',
    white: 'bg-zinc-100 text-black border-white font-black',
    muted: 'bg-zinc-900/80 text-zinc-400 border-zinc-800',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.2em] border rounded-none ${toneClasses[tone] || toneClasses.red} ${className}`}
    >
      <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}

/**
 * Pulsing Radar Target Ring
 */
export function PulseRing({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -m-2 border border-red-600/40 animate-ping opacity-60 ${className}`}
    />
  );
}

/**
 * Ambient Tactical Floating Dust / Embers
 */
export function Particles({ count = 10, className = '' }) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 9.3 + 12) % 100}%`,
      top: `${(i * 13.7 + 7) % 100}%`,
      duration: 3 + (i % 4),
      delay: (i * 0.4) % 2,
      size: i % 2 === 0 ? 'w-1 h-1' : 'w-1.5 h-1.5',
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className={`absolute rounded-full bg-red-600/40 shadow-[0_0_8px_#dc2626] ${d.size}`}
          style={{ left: d.left, top: d.top }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default {
  Corners,
  ClassifiedTag,
  PulseRing,
  Particles,
};

