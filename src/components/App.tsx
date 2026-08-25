import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { App as CapApp } from '@capacitor/app';
import { MonthHeader } from './MonthHeader';
import { CalendarGrid } from './CalendarGrid';
import { useCalendar } from '../hooks/useCalendar';
import './App.css';

function scrollToToday() {
  requestAnimationFrame(() => {
    const gridBody = document.querySelector('.grid-body');
    if (!gridBody) return;
    const todayRow = gridBody.querySelector('.grid-row.today') as HTMLElement | null;
    if (!todayRow) return;
    const offset = todayRow.offsetTop - gridBody.clientHeight / 3;
    gridBody.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  });
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading, authState, isDemoMode } = useCalendar(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Month navigation ───────────────────────────────────────────────
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const handlePrevMonth = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);
  const handleToday    = useCallback(() => setCurrentDate(new Date()), []);

  // ── Auto-scroll to today ───────────────────────────────────────────
  const prevLoading = useRef(loading);
  useEffect(() => {
    const justFinishedLoading = prevLoading.current === true && loading === false;
    prevLoading.current = loading;
    if (justFinishedLoading) scrollToToday();
  }, [loading]);

  const prevDate = useRef(currentDate);
  useEffect(() => {
    if (prevDate.current !== currentDate) {
      prevDate.current = currentDate;
      if (!loading) scrollToToday();
    }
  }, [currentDate, loading]);

  // ── Night schedule (10 PM – 6 AM) ─────────────────────────────────
  // Dims the UI and releases the wake lock so the tablet sleeps via its
  // normal screen timeout. FLAG_KEEP_SCREEN_ON dies with the Activity,
  // so after an overnight sleep / app restart it must be re-acquired on
  // every wake path (visibilitychange, focus, native resume) — and the
  // result is verified, with retries, because the bridge can reject
  // plugin calls right after the activity is recreated.
  const [nightMode, setNightMode] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let consecutiveFails = 0;
    const pending = new Set<ReturnType<typeof setTimeout>>();

    async function acquire() {
      await KeepAwake.keepAwake();
      const { isKeptAwake } = await KeepAwake.isKeptAwake();
      if (!isKeptAwake) throw new Error('FLAG_KEEP_SCREEN_ON not set after keepAwake()');
    }

    async function applyPowerState(reason: string) {
      const now = new Date();
      const night = now.getHours() >= 22 || now.getHours() < 6;
      setNightMode(night);

      if (!Capacitor.isNativePlatform()) return;
      try {
        if (night) {
          await KeepAwake.allowSleep();
        } else {
          await acquire();
        }
        consecutiveFails = 0;
        console.log(`[Power] ${now.toLocaleTimeString()} ${reason}: ${night ? 'sleep allowed' : 'awake'}`);
      } catch (err) {
        consecutiveFails += 1;
        console.warn(
          `[Power] ${now.toLocaleTimeString()} ${reason} FAILED (${consecutiveFails}):`,
          err,
        );
        if (!cancelled && consecutiveFails <= 5) {
          const t = setTimeout(() => {
            if (!cancelled) void applyPowerState(`${reason}/retry`);
          }, 2_000);
          pending.add(t);
        }
      }
    }

    void applyPowerState('mount');
    const timer = setInterval(() => void applyPowerState('tick'), 60_000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void applyPowerState('visibilitychange');
    };
    const onFocus = () => void applyPowerState('focus');
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    let removeResume = () => {};
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('resume', () => void applyPowerState('resume')).then((handle) => {
        if (cancelled) {
          void handle.remove();
        } else {
          removeResume = () => void handle.remove();
        }
      });
    }

    return () => {
      cancelled = true;
      clearInterval(timer);
      pending.forEach(clearTimeout);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      removeResume();
    };
  }, []);

  return (
    <div className={`app-container ${nightMode ? 'night-mode' : ''}`} ref={scrollRef}>
      <MonthHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        isDemoMode={isDemoMode}
      />
      <CalendarGrid
        days={days}
        events={events}
        loading={loading}
      />

      {loading && authState === 'authenticated' && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}
