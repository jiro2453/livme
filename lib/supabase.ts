import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './environment';

// カスタムfetch関数でタイムアウトを60秒に設定
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

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
    fetch: customFetch,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
