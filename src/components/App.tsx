import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { MonthHeader } from './MonthHeader';
import { CalendarGrid } from './CalendarGrid';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SignInOverlay } from './SignInOverlay';
import { useCalendar } from '../hooks/useCalendar';
import type { ThemeId } from '../types/theme';
import { loadTheme, saveTheme, applyTheme } from '../types/theme';
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
  const { events, loading, error, authState, isDemoMode, signIn } = useCalendar(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Theme ──────────────────────────────────────────────────────────
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const t = loadTheme();
    applyTheme(t);
    return t;
  });

  const handleThemeChange = useCallback((id: ThemeId) => {
    setThemeState(id);
    saveTheme(id);
    applyTheme(id);
  }, []);

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

  // ── Night dimming (10 PM – 6 AM) ──────────────────────────────────
  const [nightMode, setNightMode] = useState(false);
  useEffect(() => {
    function checkNight() {
      const hour = new Date().getHours();
      setNightMode(hour >= 22 || hour < 6);
    }
    checkNight();
    const timer = setInterval(checkNight, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`app-container ${nightMode ? 'night-mode' : ''}`} ref={scrollRef}>
      <MonthHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        isDemoMode={isDemoMode}
        theme={theme}
        themeSwitcher={
          <ThemeSwitcher current={theme} onChange={handleThemeChange} />
        }
      />
      <CalendarGrid
        days={days}
        events={events}
        loading={loading}
        theme={theme}
      />

      {/* Sign-in overlay — shown until Google OAuth completes */}
      {authState === 'needs-signin' && (
        <SignInOverlay
          onSignIn={signIn}
          error={error}
          theme={theme}
        />
      )}

      {loading && authState === 'authenticated' && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
}
