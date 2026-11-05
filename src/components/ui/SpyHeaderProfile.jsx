import React from 'react';
import UserAvatar from './UserAvatar';

export default function SpyHeaderProfile({ profile, onOpenStore, onOpenProfile }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 pr-4 relative">
      {/* Operative Avatar */}
      <div className="relative group cursor-pointer" onClick={onOpenProfile || onOpenStore}>
        <UserAvatar
          username={profile?.username}
          avatarUrl={profile?.avatar_url}
          size="sm"
          className="border border-zinc-800"
        />
      </div>

      {/* Black Funds & Operational Status */}
      <div className="flex items-center gap-2 font-mono text-xs cursor-pointer" onClick={onOpenStore}>
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-zinc-200 rounded-lg hover:border-zinc-700 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="font-bold tracking-wider text-amber-400">
            {profile?.soul_coins?.toLocaleString() || '0'}
          </span>
          <span className="text-[10px] text-zinc-500">SC</span>
        </div>

        {/* Clearance Level */}
        <div className="hidden sm:flex flex-col text-[9px] uppercase tracking-wider text-zinc-500 border-l border-zinc-800 pl-2">
          <span>CLEARANCE</span>
          <span className="text-red-500 font-bold">LEVEL-07</span>
        </div>
      </div>
    </div>
  );
}
