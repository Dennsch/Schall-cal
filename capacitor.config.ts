import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schall.familycalendar',
  appName: 'Schall Calendar',
  webDir: 'dist',

  // SM-T350 is 1024x768 landscape, Android 5.1.1
  android: {
    // Keep screen on — the tablet is a wall display
    allowMixedContent: true,
    backgroundColor: '#FDF6EC',
  },

  plugins: {
    StatusBar: {
      // Hide status bar for full-screen calendar display
      style: 'DARK',
      backgroundColor: '#FDF6EC',
    },
  },

  server: {
    // For development only — remove for production
    // url: 'http://YOUR_DEV_IP:5173',
    cleartext: true,
  },
};

export default config;
