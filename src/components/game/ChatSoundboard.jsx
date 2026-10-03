import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { playSoundEffect } from '../../utils/sfx';
import Soundboard from '../Soundboard';

export const ChatSoundboard = ({ roomId }) => {
  const [showFullSoundboard, setShowFullSoundboard] = useState(false);

  // Broadcast quick sound triggers over Supabase Realtime Channel
  const triggerSound = async (soundType) => {
    playSoundEffect(soundType); // Play locally instantly
    if (!roomId) return;
    try {
      const channel = supabase.channel(`room_${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'sound_emote',
        payload: { soundType }
      });
    } catch (e) {
      console.warn('Realtime quick sound trigger error:', e);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-xl overflow-x-auto select-none">
        <button 
          type="button"
          onClick={() => triggerSound('whistle')}
          className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/60 border border-purple-500/30 rounded-lg text-xs font-semibold text-white active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>😗</span>
          <span>صفارة</span>
        </button>
        <button 
          type="button"
          onClick={() => triggerSound('chuckle')}
          className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/60 border border-amber-500/30 rounded-lg text-xs font-semibold text-white active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>😏</span>
          <span>ضحكة</span>
        </button>
        <button 
          type="button"
          onClick={() => triggerSound('sizzle')}
          className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/60 border border-red-500/30 rounded-lg text-xs font-semibold text-white active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>🔥</span>
          <span>تبنزين</span>
        </button>
        <button 
          type="button"
          onClick={() => setShowFullSoundboard((prev) => !prev)}
          className={`px-2.5 py-1 border rounded-lg text-xs font-bold text-white active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm ${
            showFullSoundboard 
              ? 'bg-indigo-500 border-indigo-300' 
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/40'
          }`}
        >
          <span>🔊</span>
          <span>Soundboard</span>
        </button>
      </div>

      {/* Floating Soundboard overlay floating above chat messages */}
      {showFullSoundboard && (
        <div className="absolute bottom-16 start-2 end-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <Soundboard roomId={roomId} onClose={() => setShowFullSoundboard(false)} />
        </div>
      )}
    </>
  );
};

// Setup subscription in parent component or room
export const listenToSoundEmotes = (roomId) => {
  if (!roomId) return () => {};
  const channel = supabase
    .channel(`room_${roomId}`)
    .on('broadcast', { event: 'sound_emote' }, ({ payload }) => {
      if (payload?.soundUrl) {
        try {
          const audio = new Audio(payload.soundUrl);
          audio.play().catch((err) => console.warn('Soundboard audio playback error:', err));
        } catch (err) {
          console.warn('Audio construction error:', err);
        }
      } else if (payload?.soundType) {
        playSoundEffect(payload.soundType);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};

export default ChatSoundboard;
