import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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
    if (data.user) {
      await get().fetchProfile(data.user.id);
    }
    return data;
  },

  // Anonymous Sign In (Optional for quick play)
  signInAnonymously: async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    set({ user: data.user, session: data.session, isGuest: false });
    if (data.user) {
      await get().fetchProfile(data.user.id);
    }
    return data;
  },

  // 2. SIGN OUT (Fixes non-working signout)
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Signout error:", err);
    } finally {
      // Always reset local state and localStorage
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('guest_profile');
      set({ user: null, profile: null, session: null, isGuest: false });
    }
  },

  setUser: (user) => set({ user, loading: false }),

  initAuth: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ session, user: session.user, isGuest: false });
        await get().fetchProfile(session.user.id);
      } else {
        // Check for local guest session in localStorage
        const guestData = localStorage.getItem('guest_profile');
        if (guestData) {
          const parsed = JSON.parse(guestData);
          set({ profile: parsed, isGuest: true, user: { id: 'guest' }, session: null });
        } else {
          set({ session: null, user: null, profile: null, isGuest: false });
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ session, user: session.user, isGuest: false });
        await get().fetchProfile(session.user.id);
      } else {
        set({ session: null, user: null, profile: null });
      }
    });
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data) {
        set({ profile: data });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  },

  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Update profile after signup
    if (data.user) {
      const nick = username || email.split('@')[0];
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: nick, avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(nick)}` })
        .eq('id', data.user.id);
        
      if (profileError) console.error('Profile init error:', profileError);
      set({ user: data.user, session: data.session, isGuest: false });
      await get().fetchProfile(data.user.id);
    }
    return data;
  },

  guestLogin: (username) => {
    const guestId = crypto.randomUUID();
    const guestProfile = {
      id: guestId,
      username,
      avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      isGuest: true,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('guest_profile', JSON.stringify(guestProfile));
    set({ profile: guestProfile, isGuest: true, user: { id: guestId }, session: null });
    return { success: true };
  },

  updateProfile: async (updates) => {
    const { user, isGuest, profile } = get();
    if (!user) return { success: false, error: 'Not logged in' };

    if (isGuest) {
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
  }
}));

export default useAuthStore;
