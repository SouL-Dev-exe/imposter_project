/**
 * Card.jsx — Glass-effect content card
 */
import { motion } from 'framer-motion';

export function Card({ children, className = '', glow = false, onClick, animate = true }) {
  const Comp = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      onClick={onClick}
      className={`
        bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm
        ${glow ? 'shadow-lg shadow-violet-900/30' : ''}
        ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </Comp>
  );
}
