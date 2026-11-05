/**
 * SpyItemCard.jsx — Black Market Item Dossier Card
 * Clean AAA game styling: no emoji, no glow, Lucide icons, spring animations.
 */
import { motion } from 'framer-motion';
import { Check, Package } from 'lucide-react';
import { playClickSound, vibrate } from '../../utils/sfx';

export default function SpyItemCard({ item, isEquipped, isOwned, onAction }) {
  const handleClick = (e) => {
    e.stopPropagation();
    playClickSound();
    vibrate(30);
    onAction(item);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-zinc-950 border transition-all duration-200 p-3.5 flex flex-col rounded-xl group cursor-pointer font-sans ${
        isEquipped
          ? 'border-red-600 bg-red-950/15'
          : isOwned
          ? 'border-zinc-800 hover:border-zinc-700'
          : 'border-zinc-850 hover:border-zinc-750'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-900 pb-2 mb-2 font-mono">
        <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-bold uppercase text-zinc-400">
          {item.category?.toUpperCase() || 'EQUIPMENT'}
        </span>
        <span className="uppercase font-semibold text-zinc-500">
          {isEquipped ? 'Active' : isOwned ? 'Owned' : 'Locked'}
        </span>
      </div>

      {/* Item Icon Display */}
      <div className="my-2 flex items-center justify-center p-3 bg-zinc-900/60 border border-zinc-850 rounded-lg group-hover:border-zinc-750 transition-colors">
        <span className="text-3xl group-hover:scale-105 transition-transform">
          {item.icon || <Package size={28} className="text-zinc-500" />}
        </span>
      </div>

      {/* Item Info */}
      <div className="text-center my-1.5 min-w-0">
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate group-hover:text-red-400 transition-colors">
          {item.name}
        </h4>
        {item.description && (
          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-tight">
            {item.description}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`mt-auto w-full py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors rounded-lg border mt-2 flex items-center justify-center gap-1.5 ${
          isEquipped
            ? 'bg-zinc-800 text-zinc-200 border-zinc-700 cursor-default'
            : isOwned
            ? 'bg-zinc-900 text-zinc-200 border-zinc-750 hover:bg-zinc-800 cursor-pointer'
            : 'bg-red-600 hover:bg-red-500 text-white border-red-500 cursor-pointer'
        }`}
      >
        {isEquipped ? (
          <>
            <Check size={12} strokeWidth={3} />
            <span>Active</span>
          </>
        ) : isOwned ? (
          'Equip'
        ) : (
          `Acquire · ${(item.price || 0).toLocaleString()} SC`
        )}
      </button>
    </div>
  );
}
