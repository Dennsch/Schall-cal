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

  // ── Night schedule (10 PM – 4 AM) ─────────────────────────────────
  // Dims the UI and releases the wake lock so the tablet sleeps via its
  // normal screen timeout. Re-acquires the lock during the day, and
  // re-evaluates whenever the device wakes (visibilitychange).
  const [nightMode, setNightMode] = useState(false);
  useEffect(() => {
    async function applyPowerState() {
      const hour = new Date().getHours();
      const night = hour >= 22 || hour < 4;
      setNightMode(night);

      if (!Capacitor.isNativePlatform()) return;
      try {
        if (night) {
          await KeepAwake.allowSleep();
        } else {
          await KeepAwake.keepAwake();
        }
      } catch (err) {
        console.warn('[Power] keep-awake toggle failed:', err);
      }
    }

    applyPowerState();
    const timer = setInterval(applyPowerState, 60_000);
    document.addEventListener('visibilitychange', applyPowerState);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', applyPowerState);
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
