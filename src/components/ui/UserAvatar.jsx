/**
 * UserAvatar.jsx — Core Reusable Avatar Component with Store Cosmetics Integration.
 * Strictly constrained by parent dimensions with overflow-visible wrapper for accessory rings & badges.
 */
import { useMemo } from 'react';
import { useEconomyStore } from '../../store/economyStore';
import { getAccessoryStyle } from './ProfileModal';

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-24 h-24 text-3xl',
};

export function UserAvatar({
  username = 'Player',
  avatarUrl,
  avatarStyle,
  equipped,
  size = 'md',
  className = '',
  showBadge = true,
  onClick,
}) {
  const economyStoreStyle = useEconomyStore((s) => s.equippedAvatarStyle);
  const globalEquipped = useEconomyStore((s) => s.equipped);

  // Active avatar style: explicit prop > store state > default 'bottts'
  const activeStyle = avatarStyle || economyStoreStyle || 'bottts';

  // Active accessory ID: from equipped prop > store equipped accessory > null
  const activeAccessoryId = typeof equipped === 'string'
    ? equipped
    : equipped?.accessory || globalEquipped?.accessory || null;

  // DiceBear SVG URL generator
  const srcUrl = useMemo(() => {
    if (avatarUrl && !avatarUrl.includes('default_avatar')) {
      return avatarUrl;
    }
    return `https://api.dicebear.com/9.x/${activeStyle}/svg?seed=${encodeURIComponent(username || 'guest')}`;
  }, [avatarUrl, activeStyle, username]);

  // Accessory styling metadata (ring, crest, badge, color)
  const accMeta = useMemo(() => {
    return getAccessoryStyle(activeAccessoryId);
  }, [activeAccessoryId]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-visible ${sizeClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Floating Top Crest (Halo / Horns / Crown) */}
      {accMeta.crest && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 text-xs sm:text-sm animate-bounce drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none">
          {accMeta.crest}
        </span>
      )}

      {/* Avatar Image Container with Accessory Ring */}
      <div className={`relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-violet-900/40 to-slate-900 ${accMeta.ring || 'ring-2 ring-white/20'} transition-all duration-300`}>
        <img
          src={srcUrl}
          alt={username}
          className="w-full h-full object-cover rounded-full pointer-events-none"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(username || 'guest')}`;
          }}
        />

        {/* Constrained Accessory Frame Overlay if defined */}
        {accMeta.overlay && (
          <div
            className="absolute inset-0 pointer-events-none w-full h-full object-contain rounded-full border border-white/10"
            style={{ borderColor: accMeta.color }}
          />
        )}
      </div>

      {/* Accessory Status Badge (Bottom-Right) */}
      {showBadge && accMeta.badge && (
        <div
          className="absolute -bottom-0.5 -right-0.5 z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 border border-white/30 flex items-center justify-center text-[9px] sm:text-[10px] shadow-md drop-shadow pointer-events-none"
          title={accMeta.label || 'Equipped Accessory'}
        >
          {accMeta.badge}
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
