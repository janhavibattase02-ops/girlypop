import { createClient } from '@supabase/supabase-js';

// Supabase project connection variables
// You can replace these with your own environment variables or custom project credentials later:
export const supabaseUrl = 'https://wmyfkrknjhjtcogxtsxe.supabase.co/rest/v1/';
export const supabaseAnonKey = 'sb_publishable_D08miqqaALP7qSbgmLRQSA_Eix2PmEe';

// Clean standard Supabase base URL (strips trailing /rest/v1/ if present for standard SDK endpoints)
const normalizedUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

// Create and export the Supabase client instance
export const supabase = createClient(normalizedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
