export type ThemeId = 'classic' | 'sleek' | 'muted' | 'playful';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  swatch: string; // CSS color for the dot
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'classic',
    label: 'Classic',
    swatch: '#F5A623',
    description: 'Warm & cosy wall-calendar',
  },
  {
    id: 'sleek',
    label: 'Sleek',
    swatch: '#1E293B',
    description: 'Minimalist dark slate',
  },
  {
    id: 'muted',
    label: 'Muted',
    swatch: '#8B9BAA',
    description: 'Soft desaturated pastels',
  },
  {
    id: 'playful',
    label: 'Playful',
    swatch: '#FF4F9B',
    description: 'Bold & bouncy fun',
  },
];

const STORAGE_KEY = 'schall-cal-theme';

export function loadTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.find((t) => t.id === saved)) return saved;
  } catch {
    /* ignore */
  }
  return 'classic';
}

export function saveTheme(id: ThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.setAttribute('data-theme', id);
}
