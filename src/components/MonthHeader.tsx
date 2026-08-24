import { format } from 'date-fns';
import './MonthHeader.css';

interface MonthHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isDemoMode: boolean;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={direction === 'left' ? 'M10.5 3L5.5 8L10.5 13' : 'M5.5 3L10.5 8L5.5 13'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
          <ChevronIcon direction="left" />
        </button>

        <div className="month-title-text">
          <h1 className="month-name">{monthName.toUpperCase()}</h1>
          <span className="month-year">{year}</span>
        </div>

        <button className="nav-btn" onClick={onNextMonth} aria-label="Next month">
          <ChevronIcon direction="right" />
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
