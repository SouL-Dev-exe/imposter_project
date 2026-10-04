import { supabase } from '../../lib/supabaseClient';
import { playSoundEffect } from '../../utils/sfx';

// Setup subscription in parent component or room
export const listenToSoundEmotes = (roomId) => {
  if (!roomId) return () => {};
  const channel = supabase
    .channel(`room_${roomId}`)
    .on('broadcast', { event: 'sound_emote' }, ({ payload }) => {
      if (payload?.soundUrl) {
        try {
          const audio = new Audio(payload.soundUrl);
          audio.playsInline = true;
          audio.volume = 0.8;
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

export default listenToSoundEmotes;
