import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nngoyxbrgetbhrlsukov.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'sb_publishable_rMo2yE6Bq0qpanRFJ6rxlg_Jb8gTM5K';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 0;
};

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase config missing. Check services/supabaseClient.ts');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
