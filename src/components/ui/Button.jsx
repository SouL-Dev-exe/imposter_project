/**
 * Button.jsx — Premium game button with typeui.sh-inspired animations
 * Supports both Lucide component references (icon={Zap}) and rendered elements (icon={<Zap />})
 */
import { isValidElement } from 'react';
import { motion } from 'framer-motion';
import { playClickSound, vibrate } from '../../utils/sfx';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

const variants = {
  primary:
    'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border border-red-500/30 shadow-sm',
  secondary:
    'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-100 border border-zinc-800 hover:border-zinc-700',
  danger:
    'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border border-red-500/30',
  ghost:
    'bg-transparent hover:bg-zinc-900 active:bg-zinc-950 text-zinc-400 hover:text-zinc-100 border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border border-emerald-500/30',
  warning:
    'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-600/40 hover:border-amber-500/60',
  outline:
    'bg-transparent hover:bg-zinc-900 text-zinc-100 border border-zinc-700 hover:border-zinc-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold gap-2',
  lg: 'px-5 py-2.5 text-sm font-bold gap-2',
  xl: 'px-6 py-3 text-base font-bold gap-2.5',
};

function renderIcon(icon, iconSize) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === 'function' || typeof icon === 'object') {
    const IconComponent = icon;
    return <IconComponent size={iconSize} className="shrink-0" />;
  }
  return <span className="shrink-0">{icon}</span>;
}

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
  iconRight,
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    playClickSound();
    vibrate(30);
    onClick?.(e);
  };

  const iconSize = size === 'sm' ? 14 : size === 'xl' ? 18 : 16;

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.015, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.985, y: 0 }}
      transition={spring}
      className={[
        'relative inline-flex items-center justify-center rounded-lg',
        'transition-colors duration-150 select-none cursor-pointer tracking-wide',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {renderIcon(icon, iconSize)}
      <span className={fullWidth ? 'flex-1 text-center' : ''}>{children}</span>
      {renderIcon(iconRight, iconSize)}
    </motion.button>
  );
}

export default Button;
