import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livme.app',
  appName: 'Livme',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    scheme: 'App',
    scrollEnabled: false
  },
  server: {
    hostname: 'livme.net',
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: true
    }
  }
};

export default config;
