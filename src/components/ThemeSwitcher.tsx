import { THEMES } from '../types/theme';
import type { ThemeId } from '../types/theme';
import './ThemeSwitcher.css';

interface ThemeSwitcherProps {
  current: ThemeId;
  onChange: (id: ThemeId) => void;
}

export function ThemeSwitcher({ current, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" role="group" aria-label="Choose theme">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          className={`theme-dot ${current === theme.id ? 'active' : ''}`}
          style={{ '--dot-color': theme.swatch } as React.CSSProperties}
          onClick={() => onChange(theme.id)}
          aria-label={`${theme.label} theme`}
          aria-pressed={current === theme.id}
          title={`${theme.label}: ${theme.description}`}
        />
      ))}
    </div>
  );
}
