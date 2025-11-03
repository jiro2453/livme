export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set, using default value`);
    return defaultValue;
  }
  return value;
};

// Use placeholder values for build-time if environment variables are not set
// These should be overridden with actual values in production via Netlify environment variables
export const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://placeholder.supabase.co');
export const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'placeholder-anon-key');
