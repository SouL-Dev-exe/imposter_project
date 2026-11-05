/**
 * PlayerCard.jsx — Agent file card for lobby & room.
 * Avatar + cosmetics, equipped title, level/milestone, host flag.
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { getPlayerMilestone } from '../../utils/milestones';

const spring = { type: 'spring', stiffness: 500, damping: 30 };

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
    if (typeof titleId === 'string' && titleId.trim()) return { id: 'custom', name: titleId, accent: '#dc2626' };
    return { id: 'title_novice', name: 'Novice', accent: '#dc2626' };
  }, [titleId]);

  const equippedCosmetics = player?.equipped || (player?.isMe ? globalEquipped : null);

  if (compact) {
    return (
      <div className={`relative flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-sans min-w-0 ${className}`}>
        <UserAvatar username={name} avatarUrl={player?.avatar_url} avatarStyle={player?.avatarStyle} equipped={equippedCosmetics} size="sm" />
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <span className="text-white font-semibold text-xs truncate">{name}</span>
          <span
            className="text-[9px] font-mono px-1 rounded uppercase font-bold truncate max-w-[45%]"
            style={{
              color: titleItem.accent || '#dc2626',
              backgroundColor: `${titleItem.accent || '#dc2626'}15`,
            }}
          >
            [{titleItem.name}]
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      transition={spring}
      className={`relative bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-xl p-3 flex flex-col items-center gap-2 text-center group transition-colors min-w-0 font-sans shadow-sm ${className}`}
    >
      {/* Index & host flags */}
      <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
        {index !== undefined && (
          <span className="px-1.5 h-4.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono font-bold flex items-center justify-center border border-zinc-800 rounded">
            #{index + 1}
          </span>
        )}
        {isHost && (
          <span className="bg-zinc-100 text-zinc-900 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-1 rounded">
            <Crown size={10} />
            Host
          </span>
        )}
      </div>

      {onRemove && (
        <motion.button
          type="button"
          onClick={() => onRemove(name)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={spring}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-900 cursor-pointer transition-colors"
          title="Remove player"
          aria-label={`Remove ${name}`}
        >
          <X size={14} />
        </motion.button>
      )}

      <div className="mt-3">
        <UserAvatar username={name} avatarUrl={player?.avatar_url} avatarStyle={player?.avatarStyle} equipped={equippedCosmetics} size="md" />
      </div>

      <div className="w-full min-w-0">
        <p className="text-white font-bold text-xs truncate px-1 tracking-wide">{name}</p>
        <div className="mt-1 flex justify-center">
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold truncate max-w-full"
            style={{
              color: titleItem.accent || '#dc2626',
              borderColor: `${titleItem.accent || '#dc2626'}30`,
              backgroundColor: `${titleItem.accent || '#dc2626'}12`,
            }}
            title={`Equipped title: ${titleItem.name}`}
          >
            [{titleItem.name}]
          </span>
        </div>
      </div>

      <div className="w-full pt-1.5 border-t border-zinc-900 flex items-center justify-between gap-1 text-[10px] font-mono text-zinc-500">
        <span className={`font-semibold truncate min-w-0 ${milestone.color}`}>{milestone.title}</span>
        <span className="bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 text-zinc-300 font-bold tabular-nums">LV.{level}</span>
      </div>
    </motion.div>
  );
});

export default PlayerCard;
