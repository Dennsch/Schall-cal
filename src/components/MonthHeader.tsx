import { format } from 'date-fns';
import type { ThemeId } from '../types/theme';
import './MonthHeader.css';

// Per-month themes — used by classic + muted; sleek and light override these entirely
const MONTH_THEMES: Record<number, { bg: string; accent: string; deco: string }> = {
  0:  { bg: 'linear-gradient(135deg, #E8F4FD 0%, #B8DFF5 100%)', accent: '#3B82C4', deco: '❄️ ⛷️ ☃️' },
  1:  { bg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', accent: '#E91E63', deco: '💝 🌹 💕' },
  2:  { bg: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)', accent: '#4CAF50', deco: '🌱 ☘️ 🌸' },
  3:  { bg: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)', accent: '#F9A825', deco: '🌷 🐣 🌼' },
  4:  { bg: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)', accent: '#9C27B0', deco: '🌺 🦋 🌻' },
  5:  { bg: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)', accent: '#FF8F00', deco: '☀️ 🏖️ 🍉' },
  6:  { bg: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)', accent: '#1976D2', deco: '🎆 🌊 🍦' },
  7:  { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFB74D 100%)', accent: '#E65100', deco: '🌻 🏕️ ✨' },
  8:  { bg: 'linear-gradient(135deg, #FBE9E7 0%, #FFAB91 100%)', accent: '#BF360C', deco: '🍂 📚 🎒' },
  9:  { bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', accent: '#E65100', deco: '🎃 🍁 👻' },
  10: { bg: 'linear-gradient(135deg, #EFEBE9 0%, #BCAAA4 100%)', accent: '#5D4037', deco: '🦃 🍽️ 🍂' },
  11: { bg: 'linear-gradient(135deg, #ECEFF1 0%, #B0BEC5 100%)', accent: '#37474F', deco: '🎄 🎁 ⭐' },
};

interface MonthHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isDemoMode: boolean;
  theme: ThemeId;
  themeSwitcher: React.ReactNode;
}

export function MonthHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  isDemoMode,
  theme,
  themeSwitcher,
}: MonthHeaderProps) {
  const month = currentDate.getMonth();
  const monthName = format(currentDate, 'MMMM');
  const year = format(currentDate, 'yyyy');

  // Sleek and light themes ignore the monthly gradient — CSS handles their styling
  const useMonthGradient = theme === 'classic' || theme === 'muted';
  const classicTheme = MONTH_THEMES[month];

  const headerStyle = useMonthGradient ? { background: classicTheme.bg } : undefined;
  const accentStyle = useMonthGradient ? { color: classicTheme.accent } : undefined;

  const showDeco = theme === 'classic';
  const decoItems = classicTheme.deco.split(' ');

  return (
    <header className={`month-header theme-${theme}`} style={headerStyle}>
      <div className="header-top-row">
        <button className="nav-btn" onClick={onPrevMonth} aria-label="Previous month">
          ◀
        </button>

        <div className="month-title-block">
          {showDeco && <div className="deco-left">{decoItems[0]}</div>}
          <div className="month-title-text">
            <h1 className="month-name" style={accentStyle}>
              {monthName.toUpperCase()}
            </h1>
            <span className="month-year" style={accentStyle}>
              {year}
            </span>
          </div>
          {showDeco && <div className="deco-right">{decoItems[2]}</div>}
        </div>

        <button className="nav-btn" onClick={onNextMonth} aria-label="Next month">
          ▶
        </button>
      </div>

      <div className="header-actions">
        <button
          className="today-btn"
          onClick={onToday}
          style={accentStyle ? { borderColor: accentStyle.color, color: accentStyle.color } : undefined}
        >
          Today
        </button>
        {isDemoMode && <span className="demo-badge">✨ Demo</span>}
        {themeSwitcher}
      </div>
    </header>
  );
}
