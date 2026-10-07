import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://raykpflernyhdafsbxuj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FcDkKKITvpPPXzaikNcznw_zAIskLJp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
