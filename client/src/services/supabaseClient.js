// client/src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Fallback to project credentials if env vars are undefined or empty
const supabaseUrl = isValidHttpUrl(rawUrl)
  ? rawUrl
  : 'https://raykpflernyhdafsbxuj.supabase.co';

const supabaseAnonKey = rawKey && typeof rawKey === 'string' && rawKey.trim() !== ''
  ? rawKey
  : 'sb_publishable_FcDkKKITvpPPXzaikNcznw_zAIskLJp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
