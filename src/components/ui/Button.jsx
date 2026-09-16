/**
 * Button.jsx — Reusable button component
 */
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/40',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/40',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-900/40',
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
  return (
    <motion.button
      type={type}
      onClick={onClick}
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
