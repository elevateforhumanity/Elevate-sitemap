import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Provides authentication, real-time subscriptions, and storage
 */

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

/**
 * Get Supabase client (anon key - for client-side operations)
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
};

/**
 * Get Supabase admin client (service role key - for server-side operations)
 * WARNING: This bypasses RLS. Use with caution!
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase admin configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
};

/**
 * Verify Supabase JWT token
 */
export const verifySupabaseToken = async (token: string): Promise<any> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
  
  return data.user;
};

/**
 * Create user in Supabase Auth
 */
export const createSupabaseUser = async (email: string, password: string, metadata?: any) => {
  const supabase = getSupabaseAdminClient();
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  
  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
  
  return data.user;
};

/**
 * Delete user from Supabase Auth
 */
export const deleteSupabaseUser = async (userId: string) => {
  const supabase = getSupabaseAdminClient();
  
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

/**
 * Update user metadata
 */
export const updateSupabaseUserMetadata = async (userId: string, metadata: any) => {
  const supabase = getSupabaseAdminClient();
  
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });
  
  if (error) {
    throw new Error(`Failed to update user metadata: ${error.message}`);
  }
  
  return data.user;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: Buffer | Blob,
  options?: { contentType?: string; cacheControl?: string }
) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  return data;
};

/**
 * Get public URL for file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const supabase = getSupabaseClient();
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucket: string, path: string) => {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Subscribe to real-time changes
 */
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const supabase = getSupabaseClient();
  
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
};

export default {
  getSupabaseClient,
  getSupabaseAdminClient,
  verifySupabaseToken,
  createSupabaseUser,
  deleteSupabaseUser,
  updateSupabaseUserMetadata,
  uploadFile,
  getPublicUrl,
  deleteFile,
  subscribeToTable,
};
