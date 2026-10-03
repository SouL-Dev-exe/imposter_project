import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { tallyVotes } from '../utils/gameLogic';

let disconnectTimer = null;

// Cast vote f-database
export const submitVote = async (roomId, voterId, votedId) => {
  const { error } = await supabase
    .from('room_votes')
    .upsert(
      { room_id: roomId, voter_id: voterId, voted_id: votedId },
      { onConflict: 'room_id, voter_id' }
    );
  if (error) console.error('Error submitting vote:', error);
};

// Realtime Listener f-Room bch ga3 l-clients y-shoufou tally f-nafs l-waqt
export const subscribeToVotes = (roomId, activePlayerCount, onVotingComplete) => {
  const channel = supabase
    .channel(`votes_${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_votes', filter: `room_id=eq.${roomId}` },
      async () => {
        // Fetch all current votes for this room
        const { data: votesData } = await supabase
          .from('room_votes')
          .select('voter_id, voted_id')
          .eq('room_id', roomId);

        if (!votesData) return;

        const voteMap = {};
        votesData.forEach((v) => {
          voteMap[v.voter_id] = v.voted_id;
        });

        // Ki y-votiou ga3 l-players, y-ssra tally automatic
        if (Object.keys(voteMap).length >= activePlayerCount) {
          const result = tallyVotes(voteMap); // Uses existing tallyVotes logic
          onVotingComplete(result);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

export const handleHostDisconnect = async (roomId, currentHostId) => {
  // Grace Period ta3 30 seconds qbel ma t-t-emha l-room
  disconnectTimer = setTimeout(async () => {
    // Check remaining players f-room
    const { data: remainingPlayers } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (!remainingPlayers || remainingPlayers.length === 0) {
      // Room empty -> Hard Delete
      await supabase.from('rooms').delete().eq('id', roomId);
    } else {
      // Transfer Host l-akbar player baqi f-list
      const newHost = remainingPlayers[0];
      await supabase
        .from('rooms')
        .update({ host_id: newHost.user_id })
        .eq('id', roomId);
    }
  }, 30000); // 30s Grace Period
};

export const cancelHostDisconnectTimer = () => {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }
};

export const useMultiplayerStore = create((set, get) => ({
  roomCode: null,
  roomId: null,
  isHost: false,
  players: [],
  messages: [],
  reactions: [], // Array of { id, playerId, emoji, timestamp }
  channel: null,
  votes: {},

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
      .insert([{ room_id: roomData.id, user_id: user.id, player_id: user.id }]);

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
        .insert([{ room_id: roomData.id, user_id: user.id, player_id: user.id }]);

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
        user_id,
        profiles:user_id (id, username, avatar_url, level, xp)
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
          key: profile?.id || 'guest',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence synced
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        get().fetchRoomPlayers(roomId);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        get().fetchRoomPlayers(roomId);
        // If the host was disconnected, start host migration grace period
        const { isHost, roomId: currentRoomId, players } = get();
        if (!isHost && key) {
          handleHostDisconnect(currentRoomId, key);
        }
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
      if (status === 'SUBSCRIBED' && profile) {
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
        // Trigger host migration timer for other players
        await handleHostDisconnect(roomId, user.id);
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
  },

  submitVote: async (voterId, votedId) => {
    const { roomId } = get();
    if (!roomId) return;
    await submitVote(roomId, voterId, votedId);
  },

  subscribeToVotes: (activePlayerCount, onVotingComplete) => {
    const { roomId } = get();
    if (!roomId) return () => {};
    return subscribeToVotes(roomId, activePlayerCount, onVotingComplete);
  }
}));

export default useMultiplayerStore;
