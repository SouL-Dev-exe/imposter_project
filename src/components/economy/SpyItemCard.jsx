/**
 * SpyItemCard.jsx — Black Market Item Dossier Card
 * Tactical HUD design: Jet black, blood red highlights, monospace data.
 */
import { motion } from 'framer-motion';
import { playClickSound, vibrate } from '../../utils/sfx';

export default function SpyItemCard({ item, isEquipped, isOwned, onAction }) {
  const handleClick = (e) => {
    e.stopPropagation();
    playClickSound();
    vibrate(40);
    onAction(item);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-zinc-950/95 border transition-all duration-200 p-3.5 flex flex-col overflow-hidden group cursor-pointer font-mono rounded-sm ${
        isEquipped
          ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.35)] bg-red-950/10'
          : isOwned
          ? 'border-zinc-800 hover:border-zinc-600'
          : 'border-zinc-900 hover:border-red-900/60'
      }`}
    >
      {/* Tactical Corner Accents */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-red-600/60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-red-600/60 pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between text-[9px] text-zinc-500 border-b border-zinc-900 pb-2 mb-2 gap-2">
        <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 font-bold uppercase text-zinc-300">
          {item.category?.toUpperCase() || 'EQUIPMENT'}
        </span>
        <span className="tracking-widest text-zinc-600 uppercase font-bold">
          {isEquipped ? 'DEPLOYED' : isOwned ? 'ACQUIRED' : 'RESTRICTED'}
        </span>
      </div>

      {/* Item Icon Display */}
      <div className="my-2.5 flex items-center justify-center p-3 bg-black/60 border border-zinc-900 group-hover:border-red-900/40 transition-colors relative">
        <span className="text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform">
          {item.icon || '📦'}
        </span>
      </div>

      {/* Item Info */}
      <div className="text-center my-1.5 min-w-0">
        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide truncate group-hover:text-red-400 transition-colors">
          {item.name}
        </h4>
        {item.description && (
          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-tight">
            {item.description}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`mt-auto w-full py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none border mt-3 ${
          isEquipped
            ? 'bg-red-600 text-black border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.5)] cursor-default'
            : isOwned
            ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 cursor-pointer'
            : 'bg-red-950/40 text-red-300 border-red-900/80 hover:bg-red-600 hover:text-black cursor-pointer'
        }`}
      >
        {isEquipped
          ? '✓ ACTIVE'
          : isOwned
          ? 'EQUIP GEAR'
          : `ACQUIRE // ${(item.price || 0).toLocaleString()} BF`}
      </button>
    </div>
  );
}
