/**
 * UserAvatar.jsx — Core Reusable Avatar Component with Store Cosmetics Integration.
 * Two-layer architecture:
 *   Layer 0 (z-0): Avatar image clipped to circle via overflow-hidden — NO ring here.
 *   Layer 1 (z-10): Transparent ring overlay (absolute inset-0, bg-transparent) — ring only.
 *   Layer 2 (z-20): Floating crests / crowns above the circle.
 *   Layer 3 (z-30): Badge chip bottom-right.
 */
import { useMemo, memo } from 'react';
import { useEconomyStore } from '../../store/economyStore';
import { getAccessoryStyle } from '../../utils/accessories';

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const UserAvatar = memo(function UserAvatar({
  username = 'player',
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

  // Determine raw avatar input
  const rawAvatar = avatarUrl || avatarStyle || activeStyle || 'bottts';

  // Check if input is an emoji character
  const isEmoji = useMemo(() => {
    if (!rawAvatar || typeof rawAvatar !== 'string') return false;
    return rawAvatar.length <= 4 && !rawAvatar.startsWith('http') && !/^[a-zA-Z0-9_-]+$/.test(rawAvatar);
  }, [rawAvatar]);

  // Resolve DiceBear URL if not an emoji
  const imageSrc = useMemo(() => {
    if (isEmoji) return null;
    let src = rawAvatar;
    if (!src || typeof src !== 'string' || !src.startsWith('http')) {
      const styleName = (typeof src === 'string' && /^[a-zA-Z0-9_-]+$/.test(src)) ? src : activeStyle;
      const seed = encodeURIComponent(username || 'player');
      src = `https://api.dicebear.com/9.x/${styleName || 'bottts'}/svg?seed=${seed}`;
    }
    return src;
  }, [isEmoji, rawAvatar, activeStyle, username]);

  // Accessory styling metadata (ring class, crest emoji, badge emoji, color)
  const accMeta = useMemo(() => getAccessoryStyle(activeAccessoryId), [activeAccessoryId]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* ── Layer 2: Floating Crest (crown/halo/horns above circle) ── */}
      {accMeta.crest && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 text-xs sm:text-sm animate-bounce drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none select-none">
          {accMeta.crest}
        </span>
      )}

      {/* ── Layer 0: Avatar image — clipped to circle, NO ring here ── */}
      <div className="absolute inset-0 rounded-full overflow-hidden bg-slate-800 z-0">
        {isEmoji ? (
          <span className="flex items-center justify-center w-full h-full text-base leading-none select-none pointer-events-none">
            {rawAvatar}
          </span>
        ) : (
          <img
            src={imageSrc}
            alt={username}
            className="block w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const seed = encodeURIComponent(username || 'player');
              e.currentTarget.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}`;
            }}
          />
        )}
      </div>

      {/* ── Layer 1: Transparent ring overlay — bg-transparent so avatar shows through ── */}
      <div
        className={`absolute inset-0 rounded-full bg-transparent pointer-events-none z-10 transition-all duration-300 ${accMeta.ring || 'ring-1 ring-white/10'}`}
      />

      {/* ── Layer 3: Badge chip (bottom-right) ── */}
      {showBadge && accMeta.badge && (
        <div
          className="absolute -bottom-0.5 -right-0.5 z-30 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 border border-white/30 flex items-center justify-center text-[9px] sm:text-[10px] shadow-md pointer-events-none"
          title={accMeta.label || 'Equipped Accessory'}
        >
          {accMeta.badge}
        </div>
      )}
    </div>
  );
});

export { UserAvatar };
export default UserAvatar;
