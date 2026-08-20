import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import {
  initGoogleApi,
  createTokenClient,
  requestAccess,
  requestAccessSilent,
  hasPreviouslyGranted,
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
            // Token granted (silent or manual)
            setAuthState('authenticated');
            setError(null);
          },
          (err) => {
            // 'immediate_failed' = no stored grant → need manual sign-in
            // anything else = actual error
            if (err === 'immediate_failed') {
              setAuthState('needs-signin');
            } else {
              console.error('OAuth error:', err);
              setAuthState('needs-signin');
              setError(err);
            }
            setLoading(false);
          }
        );

        // If the user has signed in before, attempt a silent token refresh —
        // no popup, Google re-issues the token in the background
        if (hasPreviouslyGranted()) {
          setAuthState('initializing'); // keep spinner, not sign-in screen
          requestAccessSilent();
        } else {
          setAuthState('needs-signin');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to init Google API:', err);
        setIsDemoMode(true);
        setEvents(generateDemoEvents(currentDate));
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
          // Token expired mid-session — try a silent refresh first
          setAuthState('initializing');
          requestAccessSilent();
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

  // Auto-refresh every 5 minutes
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

  return {
    events,
    loading,
    error,
    authState,
    isDemoMode,
    signIn,
    refreshEvents,
  };
}
