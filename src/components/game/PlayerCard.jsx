/**
 * PlayerCard.jsx — Agent file card for lobby & room.
 * Avatar + cosmetics, equipped title, level/milestone, host flag.
 */
import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import { Corners } from '../ui/HudFrame';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { getPlayerMilestone } from '../../utils/milestones';

export const PlayerCard = memo(function PlayerCard({
  player,
  index,
  onRemove,
  isHost = false,
  compact = false,
  className = '',
}) {
  const globalEquipped = useEconomyStore((s) => s.equipped);

  const name = player?.username || player?.name || `Player ${index !== undefined ? index + 1 : 1}`;
  const level = player?.level || 1;
  const milestone = getPlayerMilestone(level);

  const titleId = player?.equipped?.title || (player?.isMe ? globalEquipped?.title : null) || 'title_novice';

  const titleItem = useMemo(() => {
    const item = getStoreItem(titleId);
    if (item) return item;
    if (typeof titleId === 'string' && titleId.trim()) return { id: 'custom', name: titleId, icon: '🏷️' };
    return { id: 'title_novice', name: 'Novice', icon: '🌱' };
  }, [titleId]);

  const equippedCosmetics = player?.equipped || (player?.isMe ? globalEquipped : null);

  if (compact) {
    return (
      <div className={`relative flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 font-mono min-w-0 ${className}`}>
        <UserAvatar username={name} avatarUrl={player?.avatar_url} avatarStyle={player?.avatarStyle} equipped={equippedCosmetics} size="sm" />
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <span className="text-white font-bold text-xs truncate">{name}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-red-900/70 text-red-400 bg-black shrink-0 max-w-[45%] truncate">
            {titleItem.icon} {titleItem.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`relative bg-zinc-950 border border-zinc-800 hover:border-red-700/80 hover:shadow-[0_0_22px_rgba(220,38,38,0.25)] p-3.5 flex flex-col items-center gap-2 text-center group transition-[border-color,box-shadow] min-w-0 font-mono ${className}`}
    >
      <Corners size="w-2 h-2" thick="border" color="border-zinc-600 group-hover:border-red-500" />

      {/* Index / host */}
      <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
        {index !== undefined && (
          <span className="px-1 h-5 min-w-5 bg-black text-red-500 text-[10px] font-black flex items-center justify-center border border-red-900/70">
            #{index + 1}
          </span>
        )}
        {isHost && (
          <span className="bg-white text-black text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-0.5">
            👑 Host
          </span>
        )}
      </div>

      {onRemove && (
        <motion.button
          type="button"
          onClick={() => onRemove(name)}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-950/40 text-xs cursor-pointer transition-colors"
          title="Remove player"
          aria-label={`Remove ${name}`}
        >
          ✕
        </motion.button>
      )}

      <div className="mt-4">
        <UserAvatar username={name} avatarUrl={player?.avatar_url} avatarStyle={player?.avatarStyle} equipped={equippedCosmetics} size="lg" />
      </div>

      <div className="w-full min-w-0">
        <p className="text-white font-black text-sm truncate px-1 tracking-wide">{name}</p>
        <div className="mt-1.5 flex justify-center">
          <span
            className="text-[10px] font-bold px-2 py-0.5 border border-red-900/70 bg-black text-red-400 uppercase tracking-wider flex items-center gap-1 max-w-full"
            title={`Equipped title: ${titleItem.name}`}
          >
            <span className="shrink-0">{titleItem.icon}</span>
            <span className="truncate">{titleItem.name}</span>
          </span>
        </div>
      </div>

      <div className="w-full pt-1.5 border-t border-zinc-900 flex items-center justify-between gap-2 text-[10px] text-zinc-500">
        <span className={`font-bold truncate min-w-0 ${milestone.color}`}>{milestone.title}</span>
        <span className="bg-zinc-900 border border-zinc-800 text-white font-bold px-1.5 shrink-0 tabular-nums">LV.{level}</span>
      </div>
    </motion.div>
  );
});

export default PlayerCard;
