import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

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
  if (!userId || userId === 'guest') return;
  try {
    const localCoinsEconomy = JSON.parse(localStorage.getItem('soul_coins_economy') || '{}');
    const guestProfile = JSON.parse(localStorage.getItem('guest_profile') || '{}');

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

    if (guestProfile.username) {
      payload.username = guestProfile.username;
      payload.avatar_url = guestProfile.avatar_url;
    }

    await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    localStorage.removeItem('soul_coins_economy');
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

  // 1. SIGN IN (Email/Password or Anonymous)
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user, session: data.session, isGuest: false });
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
    set({ user: data.user, session: data.session, isGuest: false });
    if (data.user?.id) {
      await get().fetchProfile(data.user.id);
      await migrateGuestDataToCloud(data.user.id);
    }
    return data;
  },

  // 2. SIGN OUT: Comprehensive memory & state cleanup
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout warning:', err?.message || err);
    } finally {
      // Purge all tokens and cached credentials
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'guest_profile')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        /* noop */
      }
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('guest_profile');

      // Reset Zustand memory
      set({ user: null, profile: null, session: null, isGuest: false });
    }
  },

  setUser: (user) => set({ user, loading: false }),

  // 3. INITIALIZE AUTH & SESSION HYDRATION
  initAuth: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Stale auth session encountered, clearing local tokens:', error.message);
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
              localStorage.removeItem(key);
            }
          }
        } catch { /* noop */ }
        set({ session: null, user: null, profile: null, isGuest: false });
        return;
      }

      const session = data?.session;
      if (session?.user?.id) {
        set({ session, user: session.user, isGuest: false });
        await get().fetchProfile(session.user.id);
        await migrateGuestDataToCloud(session.user.id);
      } else {
        // Check for local guest session in localStorage
        const guestData = localStorage.getItem('guest_profile');
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            set({ profile: parsed, isGuest: true, user: { id: parsed.id || 'guest' }, session: null });
          } catch {
            localStorage.removeItem('guest_profile');
            set({ session: null, user: null, profile: null, isGuest: false });
          }
        } else {
          set({ session: null, user: null, profile: null, isGuest: false });
        }
      }
    } catch (err) {
      console.warn('Auth initialization recovered from error:', err?.message || err);
      set({ session: null, user: null, profile: null, isGuest: false });
    } finally {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        set({ session: null, user: null, profile: null, isGuest: false });
      } else if (session?.user?.id) {
        set({ session, user: session.user, isGuest: false });
        await get().fetchProfile(session.user.id);
        await migrateGuestDataToCloud(session.user.id);
      }
    });
  },

  // 4. FETCH PROFILE from public.profiles
  fetchProfile: async (userId) => {
    if (!userId || userId === 'guest') return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level, xp, soul_coins, inventory, stats')
        .eq('id', userId)
        .maybeSingle();
        
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
    } catch (error) {
      console.warn('Error fetching profile:', error?.message || error);
    }
  },

  // 5. SIGN UP
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

      set({ user: data.user, session: data.session, isGuest: false, profile: newProfile });
      await migrateGuestDataToCloud(data.user.id);
    }
    return data;
  },

  // 6. GUEST LOGIN
  guestLogin: (username) => {
    const guestId = `guest_${Math.random().toString(36).slice(2, 9)}`;
    const guestProfile = {
      id: guestId,
      username: username || 'Guest',
      avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(username || 'Guest')}`,
      isGuest: true,
      level: 1,
      xp: 0,
      soul_coins: 500,
      inventory: ['title_novice', 'emote_hush'],
      stats: {},
      created_at: new Date().toISOString()
    };
    localStorage.setItem('guest_profile', JSON.stringify(guestProfile));
    set({ profile: guestProfile, isGuest: true, user: { id: guestId }, session: null });
    return { success: true };
  },

  // 7. UPDATE PROFILE
  updateProfile: async (updates) => {
    const { user, isGuest, profile } = get();
    if (!user) return { success: false, error: 'Not logged in' };

    if (isGuest || user.id === 'guest' || String(user.id).startsWith('guest_')) {
      const newProfile = { ...profile, ...updates };
      localStorage.setItem('guest_profile', JSON.stringify(newProfile));
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

  migrateGuestDataToCloud: (userId) => migrateGuestDataToCloud(userId)
}));

export default useAuthStore;
