import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Initialize native platform features for the SM-T350 tablet.
 * - Keeps the screen always on (it's a wall display)
 * - Hides the status bar for full-screen immersion
 * - Uses minimal battery by dimming at night (handled in App.tsx via CSS)
 */
export async function initNativePlatform(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Platform] Running in browser — skipping native init');
    return;
  }

  try {
    // Keep the screen always on — this is a dedicated display device
    await KeepAwake.keepAwake();
    console.log('[Platform] Keep-awake enabled');
  } catch (err) {
    console.warn('[Platform] Keep-awake failed:', err);
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
