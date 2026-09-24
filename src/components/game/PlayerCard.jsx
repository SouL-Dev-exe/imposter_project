/**
 * PlayerCard.jsx — Lobby & Room Player Card Component.
 * Displays equipped Avatar Styles, Titles ([🔥 Bluff King]), Accessory Frames, Level Badges, and Host status.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import { useEconomyStore } from '../../store/economyStore';
import { getStoreItem } from '../../data/economyCatalog';
import { getPlayerMilestone } from '../../utils/milestones';

export function PlayerCard({
  player,
  index,
  onRemove,
  isHost = false,
  compact = false,
  className = '',
}) {
  const globalEquipped = useEconomyStore((s) => s.equipped);

  const name = player?.username || player?.name || `Player ${index ? index + 1 : 1}`;
  const level = player?.level || 1;
  const milestone = getPlayerMilestone(level);

  // Equipped title resolution: player object title > global store title > Novice fallback
  const titleId = player?.equipped?.title || (player?.isMe ? globalEquipped?.title : null) || 'title_novice';
  
  const titleItem = useMemo(() => {
    const item = getStoreItem(titleId);
    if (item) return item;
    if (typeof titleId === 'string' && titleId.trim()) {
      return { id: 'custom', name: titleId, icon: '🏷️', accent: '#a855f7' };
    }
    return { id: 'title_novice', name: 'Novice', icon: '🌱', accent: '#94a3b8' };
  }, [titleId]);

  const equippedCosmetics = player?.equipped || (player?.isMe ? globalEquipped : null);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 ${className}`}>
        <UserAvatar
          username={name}
          avatarUrl={player?.avatar_url}
          avatarStyle={player?.avatarStyle}
          equipped={equippedCosmetics}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-xs truncate">{name}</span>
            {titleItem && (
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.2 rounded border shadow-sm truncate shrink-0"
                style={{
                  color: titleItem.accent || '#3b82f6',
                  borderColor: `${titleItem.accent || '#3b82f6'}50`,
                  backgroundColor: `${titleItem.accent || '#3b82f6'}15`,
                }}
              >
                {titleItem.icon} [{titleItem.name}]
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative bg-gradient-to-b from-white/10 to-white/[0.03] border border-white/15 rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center group hover:border-violet-500/50 transition-all shadow-lg ${className}`}
    >
      {/* Index or Host Badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {index !== undefined && (
          <span className="w-5 h-5 rounded-full bg-violet-600/60 text-white text-[10px] font-black flex items-center justify-center border border-white/20">
            #{index + 1}
          </span>
        )}
        {isHost && (
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            👑 Host
          </span>
        )}
      </div>

      {/* Optional Remove / Kick Button */}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(name)}
          className="absolute top-2 right-2 text-white/30 hover:text-red-400 p-1 transition-colors text-xs"
          title="Remove Player"
        >
          ✕
        </button>
      )}

      {/* Avatar Container with Store Accessory Rings & Badges */}
      <div className="mt-2">
        <UserAvatar
          username={name}
          avatarUrl={player?.avatar_url}
          avatarStyle={player?.avatarStyle}
          equipped={equippedCosmetics}
          size="lg"
        />
      </div>

      {/* Player Name */}
      <div className="w-full min-w-0">
        <p className="text-white font-extrabold text-sm truncate px-1">
          {name}
        </p>

        {/* 🌟 EQUIPPED TITLE BADGE ([🔥 Bluff King]) */}
        <div className="mt-1 flex justify-center">
          <span
            className="text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase shadow-md flex items-center gap-1 max-w-[95%] truncate"
            style={{
              color: titleItem.accent || '#3b82f6',
              borderColor: `${titleItem.accent || '#3b82f6'}60`,
              backgroundColor: `${titleItem.accent || '#3b82f6'}20`,
              boxShadow: `0 0 10px ${titleItem.accent || '#3b82f6'}30`,
            }}
            title={`Equipped Title: ${titleItem.name}`}
          >
            <span>{titleItem.icon}</span>
            <span className="truncate">[{titleItem.name}]</span>
          </span>
        </div>
      </div>

      {/* Level & Rank Badge */}
      <div className="w-full pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
        <span className={`font-extrabold ${milestone.color}`}>{milestone.title}</span>
        <span className="bg-white/10 text-white font-bold px-1.5 py-0.2 rounded-md">Lv.{level}</span>
      </div>
    </motion.div>
  );
}

export default PlayerCard;
