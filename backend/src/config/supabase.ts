import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseConnected = false;

/**
 * Initialize Supabase client and probe connection
 */
export const initSupabase = async (): Promise<boolean> => {
  try {
    if (!config.supabase.url || !config.supabase.key) {
      console.warn('⚠️ [Supabase] No SUPABASE_URL or SUPABASE_SECRET_KEY configured.');
      console.warn('   Note: Backend will run in offline/mock database mode.');
      console.warn('   To connect to live Supabase, configure SUPABASE_URL & SUPABASE_SECRET_KEY in backend/.env');
      supabaseConnected = false;
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
        console.warn('⚠️ [Supabase] Connected to Supabase project, but "users" table was not found.');
        console.warn('   Please execute "backend/supabase-schema.sql" in your Supabase SQL Editor to initialize tables.');
        supabaseConnected = true; // Connection works, schema needs to be initialized
        return true;
      }
      throw error;
    }

    supabaseConnected = true;
    console.log(`📦 [Supabase] Connected successfully to Supabase: ${config.supabase.url}`);
    return true;
  } catch (error: any) {
    supabaseConnected = false;
    console.warn('----------------------------------------------------');
    console.warn(`⚠️ [Supabase] Connection test failed: ${error.message || error}`);
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
 * Get the active Supabase client instance (or null if unconfigured)
 */
export const getSupabase = (): SupabaseClient | null => {
  return supabaseClient;
};
