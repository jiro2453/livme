import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livme.app',
  appName: 'Livme',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    }
  }
};

export default config;
