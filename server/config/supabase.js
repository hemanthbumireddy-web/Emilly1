// server/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const rawKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = isValidHttpUrl(rawUrl)
  ? rawUrl
  : 'https://raykpflernyhdafsbxuj.supabase.co';

const supabaseAnonKey = rawKey && typeof rawKey === 'string' && rawKey.trim() !== ''
  ? rawKey
  : 'sb_publishable_FcDkKKITvpPPXzaikNcznw_zAIskLJp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createAuthenticatedClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

module.exports = {
  supabase,
  createAuthenticatedClient,
};
