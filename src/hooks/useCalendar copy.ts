import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import {
  initGoogleApi,
  createTokenClient,
  requestAccess,
  restoreToken,
  loadStoredToken,
  clearStoredToken,
  fetchAllEvents,
  generateDemoEvents,
} from '../services/googleCalendar';
import { GOOGLE_CONFIG } from '../services/config';

export type AuthState = 'initializing' | 'needs-signin' | 'authenticated' | 'error';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  authState: AuthState;
  isDemoMode: boolean;
  signIn: () => void;
  refreshEvents: (date: Date) => void;
}

export function useCalendar(currentDate: Date): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hasApiKey = !!GOOGLE_CONFIG.apiKey && !!GOOGLE_CONFIG.clientId;

    if (!hasApiKey) {
      setIsDemoMode(true);
      setEvents(generateDemoEvents(currentDate));
      setLoading(false);
      return;
    }

    initGoogleApi()
      .then(() => {
        setApiReady(true);

        createTokenClient(
          () => {
            setAuthState('authenticated');
            setError(null);
          },
          (err) => {
            console.error('OAuth error:', err);
            // Token expired or revoked — clear storage and ask to sign in again
            clearStoredToken();
            setAuthState('needs-signin');
            setError(err === 'access_denied' ? null : err);
            setLoading(false);
          }
        );

        // Try to restore a previously saved token — if still valid, skip sign-in entirely
        const stored = loadStoredToken();
        if (stored) {
          restoreToken(stored.token);
          setAuthState('authenticated');
          // loading stays true — refreshEvents will fire and update it
        } else {
          setAuthState('needs-signin');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to init Google API:', err);
        setIsDemoMode(true);
        setEvents(generateDemoEvents(currentDate));
        setError(`API init failed: ${err?.message || String(err)}`);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshEvents = useCallback(
    async (date: Date) => {
      if (isDemoMode) {
        setEvents(generateDemoEvents(date));
        setLoading(false);
        return;
      }
      if (authState !== 'authenticated' || !apiReady) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetched = await fetchAllEvents(date);
        setEvents(fetched);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        if (err?.status === 401) {
          // Token rejected by server — clear it and require sign-in
          clearStoredToken();
          setAuthState('needs-signin');
        }
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    },
    [authState, isDemoMode, apiReady]
  );

  useEffect(() => {
    refreshEvents(currentDate);
  }, [currentDate, refreshEvents]);

  // Auto-refresh every 5 minutes — also keeps renewing the token before it can expire
  useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = window.setInterval(() => {
      refreshEvents(currentDate);
    }, 5 * 60 * 1000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [currentDate, refreshEvents]);

  const signIn = useCallback(() => {
    requestAccess();
  }, []);

  return { events, loading, error, authState, isDemoMode, signIn, refreshEvents };
}
