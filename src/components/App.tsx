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
import { useCalendar } from '../hooks/useCalendar';
import './App.css';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading, isDemoMode } = useCalendar(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate all days for the current month
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((d) => subMonths(d, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((d) => addMonths(d, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Auto-scroll to today's row when the month loads
  useEffect(() => {
    requestAnimationFrame(() => {
      const gridBody = document.querySelector('.grid-body');
      if (!gridBody) return;

      const todayRow = gridBody.querySelector('.grid-row.today') as HTMLElement;
      if (todayRow) {
        // Scroll so today is roughly 1/3 from the top
        const offset = todayRow.offsetTop - gridBody.clientHeight / 3;
        gridBody.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      }
    });
  }, [currentDate, loading]);

  // Dim the screen at night (10 PM - 6 AM) to save battery
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
      />
      <CalendarGrid
        days={days}
        events={events}
        loading={loading}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">🗓️</div>
        </div>
      )}
    </div>
  );
}
