import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for frontend
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);

/**
 * Auth helpers
 */
export const auth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (provider: 'google' | 'github' | 'facebook') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  /**
   * Get current user
   */
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
  
  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
  },
  
  /**
   * Update password
   */
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  },
  
  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

/**
 * Storage helpers
 */
export const storage = {
  /**
   * Upload file
   */
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Get public URL
   */
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
  
  /**
   * Download file
   */
  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Delete file
   */
  delete: async (bucket: string, paths: string[]) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
  },
};

/**
 * Real-time helpers
 */
export const realtime = {
  /**
   * Subscribe to table changes
   */
  subscribe: (
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();
    
    return channel;
  },
  
  /**
   * Unsubscribe from channel
   */
  unsubscribe: async (channel: any) => {
    await supabase.removeChannel(channel);
  },
};

export default supabase;
