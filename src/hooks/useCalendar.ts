import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar';
import {
  fetchAllEvents,
} from '../services/googleCalendar';

export type AuthState =
  | 'initializing'
  | 'authenticated'
  | 'error';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  authState: AuthState;
  isDemoMode: boolean;
  signIn: () => void;
  refreshEvents: (date: Date) => void;
}

export function useCalendar(
  currentDate: Date,
): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const refreshTimerRef = useRef<number | null>(null);

  const refreshEvents = useCallback(async (date: Date) => {
    setLoading(true);

    try {
      const fetched = await fetchAllEvents(date);

      setEvents(fetched);
      setError(null);
      setIsDemoMode(false);
    } catch (err) {
      console.error('Error fetching events:', err);

      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEvents(currentDate);
  }, [currentDate, refreshEvents]);

  useEffect(() => {
    refreshTimerRef.current = window.setInterval(() => {
      refreshEvents(currentDate);
    }, 5 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [currentDate, refreshEvents]);

  const signIn = useCallback(() => {
    // No sign-in required.
    refreshEvents(currentDate);
  }, [currentDate, refreshEvents]);

  return {
    events,
    loading,
    error,
    authState: 'authenticated',
    isDemoMode,
    signIn,
    refreshEvents,
  };
}