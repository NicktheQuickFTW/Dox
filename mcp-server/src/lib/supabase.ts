import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/index.js';

// Create Supabase client instance
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client for read operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Service client for admin operations (if service key is provided)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// Helper function to get client based on operation type
export function getSupabaseClient(requiresAuth: boolean = false) {
  if (requiresAuth && supabaseAdmin) {
    return supabaseAdmin;
  }
  return supabase;
}