import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isGuest: false,
  loading: true,

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
    if (error) return { success: false, error: error.message };

    // Update profile after signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username, avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${username}` })
        .eq('id', data.user.id);
        
      if (profileError) console.error('Profile init error:', profileError);
    }
    return { success: true };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guest_profile');
    set({ session: null, user: null, profile: null, isGuest: false });
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
