import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schall.familycalendar',
  appName: 'Schall Calendar',
  webDir: 'dist',

  android: {
    allowMixedContent: true,
    backgroundColor: '#FDF6EC',
    // Use https://localhost so Google OAuth accepts it as an authorised origin
    // (add https://localhost to your OAuth client's authorised JS origins)
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FDF6EC',
    },
  },

  server: {
    // Load the live Vercel deployment — updates deploy instantly, no APK reinstall needed
    url: 'https://schall-cal.vercel.app',
    cleartext: false,
  },
};

export default config;
