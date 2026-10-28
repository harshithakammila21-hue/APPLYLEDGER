import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================================
// Supabase Client Initialization
// Only the anon (publishable) key is used on the frontend.
// The service_role key is NEVER used in client code.
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[ApplyLedger] Supabase environment variables are not set.\n' +
    'Copy .env.example → .env and fill in your project URL and anon key.\n' +
    'The app will run in offline/demo mode until credentials are provided.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Persist session in localStorage so users stay logged in across page reloads
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'ApplyLedger',
      },
    },
  }
);
