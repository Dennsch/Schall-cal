import { format } from 'date-fns';
import './MonthHeader.css';

interface MonthHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isDemoMode: boolean;
}

export function MonthHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  isDemoMode,
}: MonthHeaderProps) {
  const monthName = format(currentDate, 'MMMM');
  const year = format(currentDate, 'yyyy');

  return (
    <header className="month-header theme-sleek">
      <div className="header-top-row">
        <button className="nav-btn" onClick={onPrevMonth} aria-label="Previous month">
          ‹
        </button>

        <div className="month-title-text">
          <h1 className="month-name">{monthName.toUpperCase()}</h1>
          <span className="month-year">{year}</span>
        </div>

        <button className="nav-btn" onClick={onNextMonth} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="header-actions">
        <button className="today-btn" onClick={onToday}>
          Today
        </button>
        {isDemoMode && <span className="demo-badge">✨ Demo</span>}
      </div>
    </header>
  );
}
