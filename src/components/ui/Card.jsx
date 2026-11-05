/**
 * Card.jsx — Premium game surface card
 */
import { motion } from 'framer-motion';

export function Card({ children, className = '', glow = false, onClick, animate = true, padding = true }) {
  const Comp = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      onClick={onClick}
      className={[
        'bg-zinc-950 border border-zinc-800 rounded-xl',
        padding ? 'p-4' : '',
        glow ? 'border-red-600/60' : 'hover:border-zinc-700',
        onClick ? 'cursor-pointer transition-colors duration-150' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Comp>
  );
}

export default Card;
