export type Theme = 'light' | 'dark';

const THEME_KEY = 'mos-theme';
const MOTION_KEY = 'mos-motion';
const themeColors: Record<Theme, string> = { light: '#cfc6ff', dark: '#120f2e' };

const root = document.documentElement;

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null): void {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // Storage can be blocked; the preference just won't persist.
    }
  },
};

export const getTheme = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

function paint(theme: Theme): void {
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
  document.dispatchEvent(new CustomEvent('mos:theme', { detail: theme }));
}

export function setTheme(theme: Theme): void {
  store.set(THEME_KEY, theme);
  paint(theme);
}

export const toggleTheme = (): void => setTheme(getTheme() === 'dark' ? 'light' : 'dark');

export const isMotionReduced = (): boolean => root.dataset.motion === 'reduced';

export function setMotionReduced(reduced: boolean): void {
  if (reduced) root.dataset.motion = 'reduced';
  else delete root.dataset.motion;
  store.set(MOTION_KEY, reduced ? 'reduced' : null);
  document.dispatchEvent(new CustomEvent('mos:motion', { detail: reduced }));
}

export function initTheme(): void {
  paint(getTheme());
  // Follow the system setting until the visitor picks a theme themselves.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (store.get(THEME_KEY) === null) paint(event.matches ? 'dark' : 'light');
  });
}
