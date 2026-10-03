import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isGuest: false,
  loading: true,

  initAuth: async () => {
    set({ loading: true });

    // 1. Listen for real-time auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().fetchOrCreateProfile(session.user);
        set({ user: session.user, isGuest: false, loading: false });
      } else if (event === 'SIGNED_OUT') {
        get().clearSession();
      } else {
        // Check guest state
        const savedGuest =
          localStorage.getItem('undercover_guest_player') ||
          localStorage.getItem('guest_profile');

        if (savedGuest) {
          try {
            set({ user: null, profile: JSON.parse(savedGuest), isGuest: true, loading: false });
          } catch {
            localStorage.removeItem('undercover_guest_player');
            set({ user: null, profile: null, isGuest: false, loading: false });
          }
        } else {
          set({ user: null, profile: null, isGuest: false, loading: false });
        }
      }
    });

    // 2. Check active Supabase session on app start
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[Auth] Session retrieval error, resetting:', error.message);
        get().clearSession();
        return;
      }

      if (session?.user) {
        await get().fetchOrCreateProfile(session.user);
        set({ user: session.user, isGuest: false, loading: false });
      } else {
        // Check guest state
        const savedGuest =
          localStorage.getItem('undercover_guest_player') ||
          localStorage.getItem('guest_profile');

        if (savedGuest) {
          try {
            set({ user: null, profile: JSON.parse(savedGuest), isGuest: true, loading: false });
          } catch {
            localStorage.removeItem('undercover_guest_player');
            set({ user: null, profile: null, isGuest: false, loading: false });
          }
        } else {
          set({ user: null, profile: null, isGuest: false, loading: false });
        }
      }
    } catch (err) {
      console.warn('[Auth] initAuth error:', err?.message || err);
      set({ user: null, profile: null, isGuest: false, loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Auto-creates profile row in public.profiles if it doesn't exist (Self-healing)
  fetchOrCreateProfile: async (user) => {
    if (!user?.id) return null;

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Fallback: create the profile row immediately with email
        const newProfile = {
          id: user.id,
          email: user.email || null,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Player',
          avatar_url: '🎭',
          level: 1,
          xp: 0,
          soul_coins: 500,
          inventory: ['title_novice', 'emote_hush'],
          stats: { wins: 0, games_played: 0, mvp_count: 0, win_streak: 0, impostor_wins: 0, civilian_wins: 0 },
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();

        if (insertErr) {
          console.warn('[Auth] Error inserting profile row:', insertErr.message);
        }
        profile = inserted || newProfile;
      }

      set({ profile });
      return profile;
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      return null;
    }
  },

  // Alias for fetchProfile
  fetchProfile: async (userId) => {
    const { user } = get();
    if (user && user.id === userId) {
      return get().fetchOrCreateProfile(user);
    }
    return get().fetchOrCreateProfile({ id: userId });
  },

  // Play as Guest
  loginAsGuest: (guestName) => {
    const finalName = guestName?.trim() || 'Guest01';
    const guestProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: finalName,
      avatar_url: '🎭',
      soul_coins: 500,
      inventory: ['title_novice', 'emote_hush'],
      is_guest: true,
      stats: { wins: 0, games_played: 0, mvp_count: 0, win_streak: 0 },
    };
    localStorage.setItem('undercover_guest_player', JSON.stringify(guestProfile));
    set({ user: null, profile: guestProfile, isGuest: true, loading: false });
  },

  guestLogin: (guestName) => get().loginAsGuest(guestName),

  // Sign In (Email / Password)
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await get().fetchOrCreateProfile(data.user);
      set({ user: data.user, isGuest: false, loading: false });
    }
    return data;
  },

  // Anonymous Sign In
  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (data.user) {
      await get().fetchOrCreateProfile(data.user);
      set({ user: data.user, isGuest: false, loading: false });
    }
    return data;
  },

  // Sign Up
  signUp: async (email, password, username) => {
    const nick = username || email.split('@')[0];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: nick },
      },
    });
    if (error) throw error;

    if (data.user) {
      await get().fetchOrCreateProfile(data.user);
      set({ user: data.user, isGuest: false, loading: false });
    }
    return data;
  },

  // Update Profile
  updateProfile: async (updates) => {
    const { user, isGuest, profile } = get();
    if (!profile && !user) return { success: false, error: 'Not logged in' };

    if (isGuest || !user?.id || String(user.id).startsWith('guest_')) {
      const newProfile = { ...profile, ...updates };
      localStorage.setItem('undercover_guest_player', JSON.stringify(newProfile));
      set({ profile: newProfile });
      return { success: true };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    set({ profile: { ...profile, ...updates } });
    return { success: true };
  },

  // Sign Out
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      get().clearSession();
    }
  },

  // Clear Session & Local Caches
  clearSession: () => {
    localStorage.removeItem('undercover_guest_player');
    localStorage.removeItem('guest_profile');
    localStorage.removeItem('soul_coins_economy');
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* noop */
    }

    set({ user: null, profile: null, isGuest: false, loading: false });
  },

  clearSessionState: () => get().clearSession(),
}));

export default useAuthStore;
