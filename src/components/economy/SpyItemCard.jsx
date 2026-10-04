import React from 'react';

export function SpyItemCard({ item, isEquipped, isOwned, onAction }) {
  return (
    <div className={`relative bg-zinc-950 border transition-all duration-200 p-4 flex flex-col justify-between overflow-hidden group ${
      isEquipped 
        ? 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.25)]' 
        : 'border-zinc-800 hover:border-red-900/80'
    }`}>
      
      {/* Background Watermark */}
      <div className="absolute -right-4 -bottom-2 text-zinc-900 font-black text-4xl select-none pointer-events-none tracking-tighter opacity-40 group-hover:text-red-950/30 transition-colors">
        RESTRICTED
      </div>

      {/* Item Serial & Classification */}
      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-3 border-b border-zinc-900 pb-1.5">
        <span className="tracking-widest">DOSSIER #{item.id?.slice(0,6) || '884-X'}</span>
        <span className={`px-1.5 py-0.5 font-bold uppercase ${
          item.rarity === 'Legendary' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-900 text-zinc-400'
        }`}>
          {item.rarity || 'CLASSIFIED'}
        </span>
      </div>

      {/* Asset Display */}
      <div className="my-4 flex items-center justify-center relative py-6 bg-zinc-900/40 border border-zinc-900 group-hover:border-red-950 transition-colors">
        <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]">
          {item.icon || '🎯'}
        </div>
      </div>

      {/* Asset Description */}
      <div className="mb-4">
        <h4 className="font-mono text-sm font-bold text-zinc-100 uppercase tracking-wide group-hover:text-red-400 transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description || item.desc}
        </p>
      </div>

      {/* Operational Trigger Button */}
      <button
        type="button"
        onClick={() => onAction(item)}
        className={`w-full py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden cursor-pointer ${
          isEquipped
            ? 'bg-red-600 text-black shadow-[0_0_15px_rgba(220,38,38,0.5)] cursor-default'
            : isOwned
            ? 'bg-zinc-900 text-red-400 border border-red-900/50 hover:bg-red-950 hover:text-white'
            : 'bg-red-950/80 text-red-200 border border-red-700/60 hover:bg-red-600 hover:text-black'
        }`}
      >
        {isEquipped ? '✓ ENGAGED (ACTIVE)' : isOwned ? 'DEPLOY GEAR' : `ACQUIRE // ${item.price} SC`}
      </button>
    </div>
  );
}

export default SpyItemCard;
