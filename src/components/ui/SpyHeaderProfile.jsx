import React from 'react';
import UserAvatar from './UserAvatar';

export default function SpyHeaderProfile({ profile, onOpenStore, onOpenProfile }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-950/90 border border-red-900/40 rounded-none p-1.5 pr-4 shadow-[0_0_20px_rgba(185,28,28,0.15)] relative backdrop-blur-md">
      
      {/* Tactical Reticle Corner Accents */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-600 pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-600 pointer-events-none" />

      {/* Operative Avatar with Scope Target */}
      <div className="relative group cursor-pointer" onClick={onOpenProfile || onOpenStore}>
        <UserAvatar
          username={profile?.username}
          avatarUrl={profile?.avatar_url}
          size="sm"
          className="border border-red-600/50"
        />
        <div className="absolute inset-0 border border-red-500/0 group-hover:border-red-500/100 transition-all rounded-full scale-125 pointer-events-none" />
      </div>

      {/* Black Funds & Operational Status */}
      <div className="flex items-center gap-2 font-mono text-xs cursor-pointer" onClick={onOpenStore}>
        <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-900/60 px-2.5 py-1 text-red-200 hover:border-red-500 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold tracking-wider text-amber-400">
            {profile?.soul_coins?.toLocaleString() || '0'}
          </span>
          <span className="text-[10px] text-red-400/80">CREDITS</span>
        </div>

        {/* Clearance Level */}
        <div className="hidden sm:flex flex-col text-[9px] uppercase tracking-widest text-zinc-500 border-l border-zinc-800 pl-2">
          <span>CLEARANCE</span>
          <span className="text-red-500 font-bold">LEVEL-07</span>
        </div>
      </div>
    </div>
  );
}
