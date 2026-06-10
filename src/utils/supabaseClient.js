import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

if (!isConfigured) {
  console.warn('⚠️ Supabase credentials not configured in .env. App will run in offline mode.');
}

// Support both new publishable key (sb_publishable_...) and legacy anon key (eyJ...)
const clientOptions = supabaseAnonKey?.startsWith('sb_publishable_')
  ? {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  : {};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  clientOptions
);

export const isSupabaseConfigured = () => isConfigured;
