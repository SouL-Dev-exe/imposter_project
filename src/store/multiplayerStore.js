import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

export const useMultiplayerStore = create((set, get) => ({
  roomCode: null,
  roomId: null,
  isHost: false,
  players: [],
  messages: [],
  reactions: [], // Array of { id, playerId, emoji, timestamp }
  channel: null,

  generateRoomCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  },

  createRoom: async () => {
    const { profile, user } = useAuthStore.getState();
    if (!profile) return { success: false, error: 'Must be logged in or guest to create a room.' };

    const code = get().generateRoomCode();
    
    // Insert into rooms table
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([{ room_code: code, host_id: user.id }])
      .select()
      .single();

    if (roomError) return { success: false, error: roomError.message };

    // Insert host into room_players
    const { error: joinError } = await supabase
      .from('room_players')
      .insert([{ room_id: roomData.id, player_id: user.id }]);

    if (joinError) return { success: false, error: joinError.message };

    set({ roomCode: code, roomId: roomData.id, isHost: true });
    await get().connectToRoom(roomData.id);
    return { success: true, roomCode: code };
  },

  joinRoom: async (code) => {
    const { profile, user } = useAuthStore.getState();
    if (!profile) return { success: false, error: 'Must be logged in or guest to join.' };

    const upperCode = code.toUpperCase();

    // Find room
    const { data: roomData, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', upperCode)
      .single();

    if (findError || !roomData) return { success: false, error: 'Room not found.' };

    // Check if already in room
    const { data: existingPlayer } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomData.id)
      .eq('player_id', user.id)
      .single();

    if (!existingPlayer) {
      // Insert into room_players
      const { error: joinError } = await supabase
        .from('room_players')
        .insert([{ room_id: roomData.id, player_id: user.id }]);

      if (joinError) return { success: false, error: joinError.message };
    }

    set({ 
      roomCode: upperCode, 
      roomId: roomData.id, 
      isHost: roomData.host_id === user.id 
    });
    
    await get().connectToRoom(roomData.id);
    return { success: true };
  },

  fetchRoomPlayers: async (roomId) => {
    const { user, isGuest, fetchProfile } = useAuthStore.getState();
    if (user?.id && !isGuest && fetchProfile) {
      await fetchProfile(user.id);
    }

    const { data, error } = await supabase
      .from('room_players')
      .select(`
        player_id,
        profiles:player_id (id, username, avatar_url, level, xp)
      `)
      .eq('room_id', roomId);

    if (data) {
      // Map it to a cleaner array of profile objects
      const mappedPlayers = data.map(rp => rp.profiles).filter(Boolean);
      set({ players: mappedPlayers });
    }
  },

  connectToRoom: async (roomId) => {
    // Cleanup existing channel
    const existing = get().channel;
    if (existing) await supabase.removeChannel(existing);

    const { profile } = useAuthStore.getState();

    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // We could use presence to show online/offline, but DB fetch is safer for joining
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        get().fetchRoomPlayers(roomId);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        get().fetchRoomPlayers(roomId);
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        set((state) => ({ messages: [...state.messages, payload] }));
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const reaction = {
          id: Math.random().toString(36).substring(7),
          ...payload,
          timestamp: Date.now()
        };
        set((state) => ({ reactions: [...state.reactions, reaction] }));
        
        // Auto-remove reaction after 2s
        setTimeout(() => {
          set((state) => ({
            reactions: state.reactions.filter(r => r.id !== reaction.id)
          }));
        }, 2000);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url
        });
        get().fetchRoomPlayers(roomId);
      }
    });

    set({ channel, messages: [], reactions: [] });
  },

  leaveRoom: async () => {
    const { channel, roomId, isHost } = get();
    const { user } = useAuthStore.getState();

    if (channel) await supabase.removeChannel(channel);
    
    if (roomId && user) {
      if (isHost) {
        // Host leaves -> Delete room immediately from Supabase
        await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId);
      } else {
        // Regular player leaves -> remove from room_players
        await supabase
          .from('room_players')
          .delete()
          .eq('room_id', roomId)
          .eq('player_id', user.id);
      }
    }

    set({ roomCode: null, roomId: null, isHost: false, players: [], channel: null, messages: [], reactions: [] });
  },

  sendMessage: async (text) => {
    const { channel } = get();
    const { profile } = useAuthStore.getState();
    if (!channel || !profile || !text.trim()) return;

    const payload = {
      user_id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      text: text.trim(),
      timestamp: Date.now()
    };

    // Optimistic UI
    set((state) => ({ messages: [...state.messages, payload] }));

    await channel.send({
      type: 'broadcast',
      event: 'chat',
      payload
    });
  },

  sendReaction: async (emoji) => {
    const { channel } = get();
    const { profile } = useAuthStore.getState();
    if (!channel || !profile) return;

    const payload = {
      playerId: profile.id,
      emoji
    };

    // Optimistic local update
    const reaction = { id: Math.random().toString(36).substring(7), ...payload, timestamp: Date.now() };
    set((state) => ({ reactions: [...state.reactions, reaction] }));
    setTimeout(() => {
      set((state) => ({
        reactions: state.reactions.filter(r => r.id !== reaction.id)
      }));
    }, 2000);

    await channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload
    });
  }
}));
