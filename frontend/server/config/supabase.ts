import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

let supabaseClient: SupabaseClient | null = null;
let supabaseConnected = false;
let supabaseTablesReady = false;

/**
 * Initialize Supabase client and probe connection
 */
export const initSupabase = async (): Promise<boolean> => {
  try {
    if (!config.supabase.url || !config.supabase.key) {
      supabaseConnected = false;
      supabaseTablesReady = false;
      return false;
    }

    if (!supabaseClient) {
      supabaseClient = createClient(config.supabase.url, config.supabase.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    // Test connectivity by probing the users table
    const { error } = await supabaseClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        supabaseConnected = true;
        supabaseTablesReady = false;
        return true;
      }
      throw error;
    }

    supabaseConnected = true;
    supabaseTablesReady = true;
    return true;
  } catch (error: any) {
    supabaseConnected = false;
    supabaseTablesReady = false;
    return false;
  }
};

/**
 * Check if Supabase credentials are configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabase.url && config.supabase.key);
};

/**
 * Check if live Supabase database is reachable / configured
 */
export const isSupabaseConnected = (): boolean => {
  return isSupabaseConfigured();
};

/**
 * Check if database tables are ready (defaults to true if configured, refined by probe)
 */
export const areSupabaseTablesReady = (): boolean => {
  return isSupabaseConfigured();
};

/**
 * Get the active Supabase client instance (or null if unconfigured)
 */
export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseClient && config.supabase.url && config.supabase.key) {
    supabaseClient = createClient(config.supabase.url, config.supabase.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    // Trigger non-blocking async probe
    initSupabase().catch(() => {});
  }
  return supabaseClient;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Validate whether a string is a valid UUID before passing to PostgreSQL
 */
export const isUuid = (id?: string | null): boolean => {
  return typeof id === 'string' && UUID_REGEX.test(id);
};
