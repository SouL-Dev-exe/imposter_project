import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { playSoundEffect } from '../../utils/sfx';

export const ChatSoundboard = ({ roomId }) => {
  // Broadcast sound triggers over Supabase Realtime Channel
  const triggerSound = async (soundType) => {
    playSoundEffect(soundType); // Play locally instantly
    if (!roomId) return;
    const channel = supabase.channel(`room_${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'sound_emote',
      payload: { soundType }
    });
  };

  return (
    <div className="flex gap-2 p-2 bg-black/30 border border-white/5 rounded-xl overflow-x-auto select-none">
      <button 
        type="button"
        onClick={() => triggerSound('whistle')}
        className="px-3 py-1.5 bg-purple-600/40 border border-purple-500/30 rounded-lg text-xs font-semibold text-white hover:bg-purple-600/60 active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
      >
        <span>😗</span>
        <span>صفارة</span>
      </button>
      <button 
        type="button"
        onClick={() => triggerSound('chuckle')}
        className="px-3 py-1.5 bg-amber-600/40 border border-amber-500/30 rounded-lg text-xs font-semibold text-white hover:bg-amber-600/60 active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
      >
        <span>😏</span>
        <span>ضحكة</span>
      </button>
      <button 
        type="button"
        onClick={() => triggerSound('sizzle')}
        className="px-3 py-1.5 bg-red-600/40 border border-red-500/30 rounded-lg text-xs font-semibold text-white hover:bg-red-600/60 active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
      >
        <span>🔥</span>
        <span>تبنزين</span>
      </button>
    </div>
  );
};

// Setup subscription in parent component or room
export const listenToSoundEmotes = (roomId) => {
  if (!roomId) return () => {};
  const channel = supabase
    .channel(`room_${roomId}`)
    .on('broadcast', { event: 'sound_emote' }, ({ payload }) => {
      if (payload?.soundType) {
        playSoundEffect(payload.soundType);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};

export default ChatSoundboard;
