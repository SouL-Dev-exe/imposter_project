import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { tallyVotes } from '../utils/gameLogic';

let disconnectTimer = null;

// ─── Online Voting Helper ──────────────────────────────────────────────────────
export const submitVote = async (roomId, voterId, votedId, round = 1) => {
  if (!roomId || !voterId || !votedId) return { success: false, error: 'Missing parameters' };

  try {
    const { error } = await supabase
      .from('room_votes')
      .upsert(
        {
          room_id: roomId,
          voter_id: String(voterId),
          target_id: String(votedId),
          round: Number(round) || 1,
        },
        { onConflict: 'room_id, voter_id, round' }
      );

    if (error) {
      console.warn('[Multiplayer] Vote submission fallback:', error.message);
      // Fallback without round constraint if table constraint is (room_id, voter_id)
      await supabase
        .from('room_votes')
        .upsert({
          room_id: roomId,
          voter_id: String(voterId),
          target_id: String(votedId),
          round: Number(round) || 1,
        });
    }
    return { success: true };
  } catch (err) {
    console.error('[Multiplayer] Failed to submit vote:', err);
    return { success: false, error: err.message };
  }
};

// ─── Realtime Vote Listener with Tie-Breaking Safety ──────────────────────────
export const subscribeToVotes = (roomId, activePlayerCount, onVotingComplete, currentRound = 1) => {
  if (!roomId) return () => {};

  const channel = supabase
    .channel(`votes_${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_votes', filter: `room_id=eq.${roomId}` },
      async () => {
        const { data: votesData } = await supabase
          .from('room_votes')
          .select('voter_id, target_id, round')
          .eq('room_id', roomId);

        if (!votesData || votesData.length === 0) return;

        // Filter votes for current round
        const currentVotes = votesData.filter((v) => (v.round || 1) === (currentRound || 1));
        const voteMap = {};
        currentVotes.forEach((v) => {
          voteMap[v.voter_id] = v.target_id;
        });

        // When all active players cast their votes, evaluate tally
        if (Object.keys(voteMap).length >= activePlayerCount && activePlayerCount > 0) {
          const result = tallyVotes(voteMap);
          onVotingComplete({
            ...result,
            voteMap,
            totalVotes: Object.keys(voteMap).length,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ─── Host Disconnect Grace Period & Migration ────────────────────────────────
export const handleHostDisconnect = async (roomId, currentHostId) => {
  if (!roomId) return;
  if (disconnectTimer) clearTimeout(disconnectTimer);

  disconnectTimer = setTimeout(async () => {
    try {
      const { data: remainingPlayers } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .order('id', { ascending: true });

      if (!remainingPlayers || remainingPlayers.length === 0) {
        // Room is empty -> clean delete
        await supabase.from('rooms').delete().eq('id', roomId);
      } else {
        // Reassign host to first remaining player
        const newHost = remainingPlayers[0];
        
        // Update rooms table
        if (newHost.user_id) {
          await supabase
            .from('rooms')
            .update({ host_id: newHost.user_id })
            .eq('id', roomId);
        }

        // Update room_players is_host flag
        await supabase
          .from('room_players')
          .update({ is_host: true })
          .eq('id', newHost.id);
      }
    } catch (err) {
      console.warn('[Multiplayer] Host migration error:', err);
    }
  }, 30000); // 30s Grace Period
};

export const cancelHostDisconnectTimer = () => {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }
};

// ─── Zustand Multiplayer Store ────────────────────────────────────────────────
export const useMultiplayerStore = create((set, get) => ({
  roomCode: null,
  roomId: null,
  isHost: false,
  roomStatus: 'lobby', // 'lobby' | 'reveal' | 'clues' | 'voting' | 'ended'
  players: [],
  messages: [],
  reactions: [],
  channel: null,
  roomChannel: null,
  votes: {},

  generateRoomCode: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  },

  // 1. CREATE ROOM
  createRoom: async () => {
    const { profile, user, isGuest } = useAuthStore.getState();
    if (!profile || !profile.username) {
      return { success: false, error: 'Must have a profile to create a room. Please log in or enter your nickname.' };
    }

    const code = get().generateRoomCode();
    const hostUserId = (!isGuest && user?.id && !String(user.id).startsWith('guest')) ? user.id : null;
    const hostGuestId = isGuest ? (profile.id || `guest_${Date.now()}`) : null;
    
    // Insert into public.rooms (Schema truth: room_code, host_id, status, settings, game_state)
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert([{
        room_code: code,
        host_id: hostUserId,
        status: 'lobby',
        settings: { discussion_time: 120, game_mode: 'conscious' },
        game_state: { round: 1, phase: 'lobby' },
      }])
      .select()
      .single();

    if (roomError) return { success: false, error: roomError.message };

    // Insert host into public.room_players matching schema: room_id, player_id, guest_id, name, avatar_url, is_alive, is_host, score
    const { error: playerError } = await supabase
      .from('room_players')
      .insert([{
        room_id: roomData.id,
        player_id: hostUserId,
        guest_id: hostGuestId,
        name: profile.username || 'Host',
        avatar_url: profile.avatar_url || '🎭',
        is_alive: true,
        is_host: true,
        score: 0,
      }]);

    if (playerError) {
      console.warn('[Multiplayer] Host player insert fallback:', playerError.message);
      // Retry with alternative player_name column if table schema differs
      await supabase
        .from('room_players')
        .insert([{
          room_id: roomData.id,
          user_id: hostUserId,
          player_name: profile.username || 'Host',
          name: profile.username || 'Host',
          avatar_url: profile.avatar_url || '🎭',
          is_alive: true,
          is_host: true,
          score: 0,
        }]);
    }

    set({ roomCode: code, roomId: roomData.id, isHost: true, roomStatus: 'lobby' });
    await get().connectToRoom(roomData.id);
    return { success: true, roomCode: code, roomId: roomData.id };
  },

  // 2. JOIN ROOM
  joinRoom: async (code) => {
    const { profile, user, isGuest } = useAuthStore.getState();
    if (!profile || !profile.username) {
      return { success: false, error: 'Must have a profile to join. Please log in or enter your nickname.' };
    }

    const upperCode = String(code).trim().toUpperCase();
    const joinUserId = (!isGuest && user?.id && !String(user.id).startsWith('guest')) ? user.id : null;
    const joinGuestId = isGuest ? (profile.id || `guest_${Date.now()}`) : null;

    // Find room in public.rooms
    const { data: roomData, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', upperCode)
      .maybeSingle();

    if (findError || !roomData) return { success: false, error: 'Room not found. Check code.' };

    // Check if player is already registered in this room
    let existingQuery = supabase.from('room_players').select('*').eq('room_id', roomData.id);
    if (joinUserId) {
      existingQuery = existingQuery.eq('player_id', joinUserId);
    } else {
      existingQuery = existingQuery.eq('name', profile.username);
    }
    const { data: existingPlayer } = await existingQuery.maybeSingle();

    if (!existingPlayer) {
      // Insert new player in public.room_players
      const { error: joinError } = await supabase
        .from('room_players')
        .insert([{
          room_id: roomData.id,
          player_id: joinUserId,
          guest_id: joinGuestId,
          name: profile.username || 'Player',
          avatar_url: profile.avatar_url || '🎭',
          is_alive: true,
          is_host: false,
          score: 0,
        }]);

      if (joinError) {
        console.warn('[Multiplayer] Player join insert fallback:', joinError.message);
        await supabase
          .from('room_players')
          .insert([{
            room_id: roomData.id,
            user_id: joinUserId,
            player_name: profile.username || 'Player',
            name: profile.username || 'Player',
            avatar_url: profile.avatar_url || '🎭',
            is_alive: true,
            is_host: false,
            score: 0,
          }]);
      }
    }

    const isCurrentHost = joinUserId && roomData.host_id === joinUserId;

    set({ 
      roomCode: upperCode, 
      roomId: roomData.id, 
      isHost: Boolean(isCurrentHost),
      roomStatus: roomData.status || 'lobby',
    });
    
    await get().connectToRoom(roomData.id);
    return { success: true, roomCode: upperCode, roomId: roomData.id };
  },

  // 3. FETCH ROOM PLAYERS
  fetchRoomPlayers: async (roomId) => {
    if (!roomId) return;
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId);

      if (data && !error) {
        const mapped = data.map((rp) => {
          const playerName = rp.name || rp.player_name || 'Player';
          const pId = rp.id;
          const uId = rp.player_id || rp.user_id || rp.guest_id || pId;
          return {
            id: pId,
            playerId: pId,
            userId: uId,
            name: playerName,
            username: playerName,
            player_name: playerName,
            avatar_url: rp.avatar_url || '🎭',
            role: rp.role,
            word: rp.word,
            is_alive: rp.is_alive ?? true,
            is_host: rp.is_host ?? false,
            score: rp.score ?? 0,
          };
        });
        set({ players: mapped });
      }
    } catch (err) {
      console.warn('[Multiplayer] Error fetching room players:', err);
    }
  },

  // 4. REALTIME CONNECT
  connectToRoom: async (roomId) => {
    // Cleanup existing channel
    const existing = get().channel;
    if (existing) await supabase.removeChannel(existing);
    const existingRoom = get().roomChannel;
    if (existingRoom) await supabase.removeChannel(existingRoom);

    const { profile } = useAuthStore.getState();

    // Channel 1: Presence & In-room Broadcast
    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        presence: {
          key: profile?.username || `player_${Math.random().toString(36).slice(2, 7)}`,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        get().fetchRoomPlayers(roomId);
      })
      .on('presence', { event: 'join' }, () => {
        get().fetchRoomPlayers(roomId);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        get().fetchRoomPlayers(roomId);
        const { isHost, roomId: currentRoomId } = get();
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
        setTimeout(() => {
          set((state) => ({
            reactions: state.reactions.filter((r) => r.id !== reaction.id),
          }));
        }, 2000);
      });

    // Channel 2: Room Status Postgres Changes (Room lifecycle sync)
    const roomChannel = supabase
      .channel(`room_status_${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.new) {
            set({
              roomStatus: payload.new.status,
            });
          }
        }
      )
      .subscribe();

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && profile) {
        await channel.track({
          username: profile.username,
          avatar_url: profile.avatar_url,
        });
        get().fetchRoomPlayers(roomId);
      }
    });

    set({ channel, roomChannel, messages: [], reactions: [] });
  },

  // 5. LEAVE ROOM
  leaveRoom: async () => {
    const { channel, roomChannel, roomId, isHost } = get();
    const { profile, user } = useAuthStore.getState();

    cancelHostDisconnectTimer();
    if (channel) await supabase.removeChannel(channel);
    if (roomChannel) await supabase.removeChannel(roomChannel);
    
    if (roomId) {
      if (isHost) {
        await handleHostDisconnect(roomId, user?.id);
      } else {
        // Delete player record
        let deleteQuery = supabase.from('room_players').delete().eq('room_id', roomId);
        if (user?.id && !String(user.id).startsWith('guest')) {
          deleteQuery = deleteQuery.eq('user_id', user.id);
        } else if (profile?.username) {
          deleteQuery = deleteQuery.eq('player_name', profile.username);
        }
        await deleteQuery;
      }
    }

    set({
      roomCode: null,
      roomId: null,
      isHost: false,
      roomStatus: 'lobby',
      players: [],
      channel: null,
      roomChannel: null,
      messages: [],
      reactions: [],
      votes: {},
    });
  },

  // 6. SEND CHAT MESSAGE
  sendMessage: async (text) => {
    const { channel } = get();
    const { profile } = useAuthStore.getState();
    if (!channel || !profile || !text.trim()) return;

    const payload = {
      username: profile.username || 'Player',
      avatar_url: profile.avatar_url,
      text: text.trim(),
      timestamp: Date.now(),
    };

    set((state) => ({ messages: [...state.messages, payload] }));

    await channel.send({
      type: 'broadcast',
      event: 'chat',
      payload,
    });
  },

  // 7. SEND REACTION
  sendReaction: async (emoji) => {
    const { channel } = get();
    const { profile } = useAuthStore.getState();
    if (!channel || !profile) return;

    const payload = {
      playerId: profile.username || 'me',
      emoji,
    };

    const reaction = { id: Math.random().toString(36).substring(7), ...payload, timestamp: Date.now() };
    set((state) => ({ reactions: [...state.reactions, reaction] }));
    setTimeout(() => {
      set((state) => ({
        reactions: state.reactions.filter((r) => r.id !== reaction.id),
      }));
    }, 2000);

    await channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload,
    });
  },

  // 8. UPDATE ROOM STATUS
  updateRoomStatus: async (newStatus, gameState = {}) => {
    const { roomId } = get();
    if (!roomId) return;
    await supabase
      .from('rooms')
      .update({ status: newStatus, game_state: gameState })
      .eq('id', roomId);
    set({ roomStatus: newStatus });
  },

  submitVote: async (voterId, votedId, round = 1) => {
    const { roomId } = get();
    if (!roomId) return;
    return await submitVote(roomId, voterId, votedId, round);
  },

  subscribeToVotes: (activePlayerCount, onVotingComplete, currentRound = 1) => {
    const { roomId } = get();
    if (!roomId) return () => {};
    return subscribeToVotes(roomId, activePlayerCount, onVotingComplete, currentRound);
  }
}));

export default useMultiplayerStore;
