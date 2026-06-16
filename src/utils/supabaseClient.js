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

// Clear corrupted Supabase auth data from localStorage to fix "block checksum mismatch" errors
const clearCorruptedAuthData = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        try {
          const val = localStorage.getItem(key);
          if (val) JSON.parse(val); // Will throw if corrupted
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      console.warn(`🧹 Cleared corrupted auth key: ${k}`);
    });
  } catch (e) {
    // Fallback: clear all supabase keys if iteration itself fails
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') || k.includes('supabase'))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* silent */ }
  }
};

clearCorruptedAuthData();

// Support both new publishable key (sb_publishable_...) and legacy anon key (eyJ...)
// detectSessionInUrl must be true for Google OAuth redirect flow
const clientOptions = supabaseAnonKey?.startsWith('sb_publishable_')
  ? {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  : {
      auth: {
        detectSessionInUrl: true,
      },
    };

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  clientOptions
);

export const isSupabaseConfigured = () => isConfigured;
