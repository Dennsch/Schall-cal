import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import {
  initGoogleApi,
  createTokenClient,
  requestAccess,
  isSignedIn,
  fetchAllEvents,
  generateDemoEvents,
} from '../services/googleCalendar';
import { GOOGLE_CONFIG } from '../services/config';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  signIn: () => void;
  refreshEvents: (date: Date) => void;
}

export function useCalendar(currentDate: Date): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  // Initialize Google API
  useEffect(() => {
    const hasApiKey = !!GOOGLE_CONFIG.apiKey && !!GOOGLE_CONFIG.clientId;

    if (!hasApiKey) {
      // No API keys configured - use demo mode
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
            setIsAuthenticated(true);
            setError(null);
          },
          (err) => setError(err)
        );

        // Check if already signed in
        if (isSignedIn()) {
          setIsAuthenticated(true);
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

  // Fetch events when authenticated or date changes
  const refreshEvents = useCallback(
    async (date: Date) => {
      if (isDemoMode) {
        setEvents(generateDemoEvents(date));
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !apiReady) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetched = await fetchAllEvents(date);
        setEvents(fetched);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, isDemoMode, apiReady]
  );

  useEffect(() => {
    refreshEvents(currentDate);
  }, [currentDate, refreshEvents]);

  // Auto-refresh every 5 minutes to save battery
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
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
    isAuthenticated,
    isDemoMode,
    signIn,
    refreshEvents,
  };
}
