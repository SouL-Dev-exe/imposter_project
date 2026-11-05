/**
 * Card.jsx — Classified Intelligence Tactical Dossier Card
 */
import { motion } from 'framer-motion';

export function Card({ children, className = '', glow = false, reticle = true, onClick, animate = true }) {
  const Comp = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring', stiffness: 350, damping: 25 },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      onClick={onClick}
      className={`
        relative bg-zinc-950/90 border border-zinc-800/90 rounded-sm p-4
        backdrop-blur-md font-mono text-zinc-100 transition-all duration-200
        ${glow ? 'border-red-600/70 shadow-[0_0_30px_rgba(220,38,38,0.25)]' : 'hover:border-zinc-700'}
        ${onClick ? 'cursor-pointer hover:border-red-600/60 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {/* Reticle Corner Accents */}
      {reticle && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-600/80 pointer-events-none" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-600/80 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-600/80 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-600/80 pointer-events-none" />
        </>
      )}
      {children}
    </Comp>
  );
}

export default Card;
