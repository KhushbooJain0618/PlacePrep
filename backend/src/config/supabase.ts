import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseConnected = false;
let supabaseTablesReady = false;

/**
 * Initialize Supabase client and probe connection
 */
export const initSupabase = async (): Promise<boolean> => {
  try {
    if (!config.supabase.url || !config.supabase.key) {
      console.warn('[Supabase] No SUPABASE_URL or SUPABASE_SECRET_KEY configured.');
      console.warn('   Note: Backend will run in offline/mock database mode.');
      console.warn('   To connect to live Supabase, configure SUPABASE_URL & SUPABASE_SECRET_KEY in backend/.env');
      supabaseConnected = false;
      supabaseTablesReady = false;
      return false;
    }

    supabaseClient = createClient(config.supabase.url, config.supabase.key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Test connectivity by probing the users table or public health
    const { error } = await supabaseClient
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      // If table doesn't exist yet (e.g. schema needs to be run), provide helpful pointer
      if (error.code === '42P01') {
        console.warn('[Supabase] Connected to Supabase project, but "users" table was not found.');
        console.warn('   Please execute "backend/supabase-schema.sql" in your Supabase SQL Editor to initialize tables.');
        supabaseConnected = true;
        supabaseTablesReady = false;
        return true;
      }
      throw error;
    }

    supabaseConnected = true;
    supabaseTablesReady = true;
    console.log(`[Supabase] Connected successfully to Supabase with initialized tables: ${config.supabase.url}`);
    return true;
  } catch (error: any) {
    supabaseConnected = false;
    supabaseTablesReady = false;
    console.warn('----------------------------------------------------');
    console.warn(`[Supabase] Connection test failed: ${error.message || error}`);
    console.warn('   Note: Server will continue running in offline/mock database mode.');
    console.warn('   To connect, ensure your Supabase project is active and keys are valid in backend/.env');
    console.warn('----------------------------------------------------');
    return false;
  }
};

/**
 * Check if live Supabase database is reachable
 */
export const isSupabaseConnected = (): boolean => {
  return supabaseConnected && supabaseClient !== null;
};

/**
 * Check if required database tables (users, etc.) exist in Supabase
 */
export const areSupabaseTablesReady = (): boolean => {
  return isSupabaseConnected() && supabaseTablesReady;
};

/**
 * Get the active Supabase client instance (or null if unconfigured)
 */
export const getSupabase = (): SupabaseClient | null => {
  return supabaseClient;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Validate whether a string is a valid UUID before passing to PostgreSQL
 */
export const isUuid = (id?: string | null): boolean => {
  return typeof id === 'string' && UUID_REGEX.test(id);
};
