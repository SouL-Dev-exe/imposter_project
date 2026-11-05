/**
 * Button.jsx — Tactical Intelligence Button Component
 */
import { motion } from 'framer-motion';
import { playClickSound, vibrate } from '../../utils/sfx';

const variants = {
  primary:
    'bg-red-600 hover:bg-red-500 text-white font-mono font-bold tracking-widest uppercase border border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.4)] active:shadow-[0_0_8px_rgba(220,38,38,0.8)]',
  secondary:
    'bg-zinc-950 hover:bg-zinc-900 text-zinc-100 font-mono font-bold tracking-wider uppercase border border-zinc-800 hover:border-red-600/60 shadow-sm',
  danger:
    'bg-gradient-to-r from-red-700 to-rose-900 hover:from-red-600 hover:to-rose-800 text-white font-mono font-black tracking-widest uppercase border border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.5)]',
  ghost:
    'bg-transparent hover:bg-red-950/20 text-zinc-400 hover:text-red-400 font-mono tracking-wider uppercase border border-transparent hover:border-red-950',
  success:
    'bg-zinc-950 hover:bg-zinc-900 text-emerald-400 font-mono font-bold tracking-wider uppercase border border-emerald-600/60 hover:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  warning:
    'bg-red-950/40 hover:bg-red-900/60 text-amber-400 font-mono font-bold tracking-wider uppercase border border-amber-600/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  xl: 'px-8 py-4 text-lg tracking-widest',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  icon,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    playClickSound();
    vibrate(50);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-sm
        transition-all duration-150 select-none cursor-pointer
        disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-base shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}

export default Button;
