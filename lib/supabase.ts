import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './environment';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'livme-app',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
