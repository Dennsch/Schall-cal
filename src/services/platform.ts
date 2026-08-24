import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Initialize native platform features for the SM-T350 tablet.
 * - Keeps the screen always on during the day (it's a wall display)
 * - At night (10 PM – 6 AM) the wake lock is NOT acquired, so the tablet
 *   sleeps via its normal screen timeout (see App.tsx night schedule)
 * - Hides the status bar for full-screen immersion
 */
export async function initNativePlatform(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Platform] Running in browser — skipping native init');
    return;
  }

  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;

  if (!isNight) {
    try {
      await KeepAwake.keepAwake();
      console.log('[Platform] Keep-awake enabled');
    } catch (err) {
      console.warn('[Platform] Keep-awake failed:', err);
    }
  } else {
    console.log('[Platform] Night hours — skipping keep-awake so tablet can sleep');
  }

  try {
    // Hide status bar for full-screen calendar experience
    await StatusBar.setBackgroundColor({ color: '#FDF6EC' });
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.hide();
    console.log('[Platform] Status bar hidden');
  } catch (err) {
    console.warn('[Platform] Status bar config failed:', err);
  }
}
