import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const DEFAULT_PROFILE = {
  level: 1,
  xp: 0,
  soul_coins: 500,
  inventory: ['title_novice', 'emote_hush'],
  stats: { matches_played: 0, wins: 0, impostor_wins: 0, civilian_wins: 0 },
};

/**
 * Migration helper: Sync local guest coins and profile into public.profiles
 */
export const migrateGuestDataToCloud = async (userId) => {
  if (!userId || userId === 'guest' || String(userId).startsWith('guest_')) return;
  try {
    const localCoinsEconomy = JSON.parse(localStorage.getItem('soul_coins_economy') || '{}');
    const guestProfile = JSON.parse(
      localStorage.getItem('undercover_guest_player') ||
      localStorage.getItem('guest_profile') ||
      '{}'
    );

    if (!localCoinsEconomy.soulCoins && !localCoinsEconomy.inventory && !guestProfile.username) {
      return; // No guest progress to migrate
    }

    const payload = {
      soul_coins: localCoinsEconomy.soulCoins || 500,
      level: localCoinsEconomy.seasonLevel || 1,
      xp: localCoinsEconomy.seasonXP || 0,
      inventory: Array.isArray(localCoinsEconomy.inventory?.titles)
        ? [...(localCoinsEconomy.inventory.titles || []), ...(localCoinsEconomy.inventory.emotes || [])]
        : ['title_novice', 'emote_hush'],
      stats: { matches_played: localCoinsEconomy.totalMatches || 0, wins: localCoinsEconomy.wins || 0 },
    };

    if (guestProfile.username && !guestProfile.username.startsWith('زائر_') && !guestProfile.username.startsWith('Guest_')) {
      payload.username = guestProfile.username;
    }
    if (guestProfile.avatar_url) {
      payload.avatar_url = guestProfile.avatar_url;
    }

    await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    localStorage.removeItem('soul_coins_economy');
    localStorage.removeItem('undercover_guest_player');
    localStorage.removeItem('guest_profile');
    console.log('[Auth] Guest data migrated successfully to profile.');
  } catch (err) {
    console.warn('[Auth] Guest migration skipped or failed:', err?.message || err);
  }
};

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isGuest: false,
  loading: true,

  // 1. Initialize Auth on App Launch
  initAuth: async () => {
    set({ loading: true });

    try {
      // Check Supabase session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('[Auth] Stale session, clearing cache:', error.message);
        get().clearSessionState();
        return;
      }

      const session = data?.session;

      if (session?.user) {
        set({ user: session.user, session, isGuest: false });
        await get().fetchProfile(session.user.id);
        await migrateGuestDataToCloud(session.user.id);
        set({ loading: false });
      } else {
        // Check if guest session exists in local storage
        const savedGuest =
          localStorage.getItem('undercover_guest_player') ||
          localStorage.getItem('guest_profile');

        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            set({
              user: null,
              session: null,
              profile: parsed,
              isGuest: true,
              loading: false,
            });
          } catch {
            localStorage.removeItem('undercover_guest_player');
            localStorage.removeItem('guest_profile');
            set({ user: null, session: null, profile: null, isGuest: false, loading: false });
          }
        } else {
          // No account, no guest -> Show Landing Auth Screen
          set({ user: null, session: null, profile: null, isGuest: false, loading: false });
        }
      }
    } catch (err) {
      console.warn('[Auth] Initialization error:', err?.message || err);
      set({ user: null, session: null, profile: null, isGuest: false, loading: false });
    } finally {
      set({ loading: false });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user, session, isGuest: false, loading: false });
        await get().fetchProfile(session.user.id);
        await migrateGuestDataToCloud(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        get().clearSessionState();
      }
    });
  },

  // 2. Fetch Fresh Profile from Supabase
  fetchProfile: async (userId) => {
    if (!userId || userId === 'guest' || String(userId).startsWith('guest_')) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile from Supabase:', error);
        return;
      }

      if (data) {
        set({ profile: data });
      } else {
        // First login: create default profile row
        const defaultProfile = {
          id: userId,
          username: `Player_${userId.slice(0, 4)}`,
          avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
          ...DEFAULT_PROFILE,
        };

        const { data: inserted } = await supabase
          .from('profiles')
          .upsert([defaultProfile], { onConflict: 'id' })
          .select()
          .single();

        if (inserted) set({ profile: inserted });
      }
    } catch (err) {
      console.error('Error loading profile from Supabase:', err);
    }
  },

  // 3. Play as Guest
  loginAsGuest: (guestName) => {
    const trimmed = guestName ? guestName.trim() : '';
    const guestProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: trimmed || 'زائر_' + Math.floor(1000 + Math.random() * 9000),
      avatar_url: '🎭',
      soul_coins: 500,
      inventory: ['title_novice', 'emote_hush'],
      is_guest: true,
      stats: { matches_played: 0, wins: 0, impostor_wins: 0, civilian_wins: 0 },
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('undercover_guest_player', JSON.stringify(guestProfile));
    set({ user: null, session: null, profile: guestProfile, isGuest: true, loading: false });
    return { success: true };
  },

  // Alias for backward compatibility
  guestLogin: (guestName) => get().loginAsGuest(guestName),

  // 4. Sign In (Email / Password)
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user, session: data.session, isGuest: false, loading: false });
    if (data.user?.id) {
      await get().fetchProfile(data.user.id);
      await migrateGuestDataToCloud(data.user.id);
    }
    return data;
  },

  // Anonymous Sign In
  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    set({ user: data.user, session: data.session, isGuest: false, loading: false });
    if (data.user?.id) {
      await get().fetchProfile(data.user.id);
      await migrateGuestDataToCloud(data.user.id);
    }
    return data;
  },

  // Sign Up
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    if (data.user?.id) {
      const nick = username || email.split('@')[0];
      const newProfile = {
        id: data.user.id,
        username: nick,
        avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(nick)}`,
        ...DEFAULT_PROFILE,
      };

      await supabase
        .from('profiles')
        .upsert([newProfile], { onConflict: 'id' });

      set({ user: data.user, session: data.session, isGuest: false, profile: newProfile, loading: false });
      await migrateGuestDataToCloud(data.user.id);
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

  // 5. Sign Out & Clear All Local Caches
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Signout error:', err);
    } finally {
      get().clearSessionState();
    }
  },

  // 6. Clear Session State and Stale Caches
  clearSessionState: () => {
    // Clear browser caches causing stale money/data
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

    set({ user: null, session: null, profile: null, isGuest: false, loading: false });
  },

  setUser: (user) => set({ user, loading: false }),
  migrateGuestDataToCloud: (userId) => migrateGuestDataToCloud(userId),
}));

export default useAuthStore;
