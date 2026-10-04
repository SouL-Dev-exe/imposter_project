/**
 * Button.jsx — Reusable button component
 */
import { motion } from 'framer-motion';
import { playClickSound, vibrate } from '../../utils/sfx';

const variants = {
  primary: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-950/60 border border-red-500/40 font-mono tracking-wider uppercase',
  secondary: 'bg-zinc-900/90 hover:bg-red-950 hover:text-white text-zinc-200 border border-zinc-800 hover:border-red-900/80 font-mono tracking-wider uppercase',
  danger: 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-950/60 border border-red-600/40 font-mono tracking-wider uppercase',
  ghost: 'text-zinc-400 hover:text-red-400 hover:bg-red-950/30 font-mono tracking-wider uppercase',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-950/40 font-mono tracking-wider uppercase',
  warning: 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-black shadow-lg shadow-amber-950/40 font-mono tracking-wider uppercase',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
  xl: 'px-8 py-4 text-xl',
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
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-colors duration-200 select-none cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-xl leading-none">{icon}</span>}
      {children}
    </motion.button>
  );
}
