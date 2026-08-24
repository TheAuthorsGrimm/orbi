import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useTheme as useAstraTheme } from '@figma/astraui';
import { useAuth } from './AuthContext';

export type OrbiTheme = 'focus' | 'warm' | 'fresh' | 'high-contrast' | 'custom';

export interface CustomTheme {
  primary: string;
  secondary: string;
  base: string;
  surface: string;
  surface2: string;
  text: string;
  textMuted: string;
  border: string;
  mode: 'dark' | 'light';
}

const STORAGE_KEY = 'orbi-theme';
const CUSTOM_STORAGE_KEY = 'orbi-theme-custom';
const VALID_THEMES: OrbiTheme[] = ['focus', 'warm', 'fresh', 'high-contrast', 'custom'];

interface ThemeContextValue {
  theme: OrbiTheme;
  setTheme: (t: OrbiTheme) => void;
  customTheme: CustomTheme | null;
  setCustomTheme: (ct: CustomTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): OrbiTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && VALID_THEMES.includes(v as OrbiTheme)) return v as OrbiTheme;
  } catch { /* ignore */ }
  return null;
}

function readCustomTheme(): CustomTheme | null {
  try {
    const v = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (v) return JSON.parse(v) as CustomTheme;
  } catch { /* ignore */ }
  return null;
}

function applyHtml(theme: OrbiTheme) {
  document.documentElement.setAttribute('data-orbi-theme', theme);
}

const CUSTOM_VARS = [
  '--orbi-base', '--orbi-surface', '--orbi-surface-2',
  '--orbi-primary', '--orbi-secondary',
  '--orbi-text', '--orbi-text-muted', '--orbi-border',
] as const;

function applyCustomVars(ct: CustomTheme) {
  const el = document.documentElement;
  el.style.setProperty('--orbi-base', ct.base);
  el.style.setProperty('--orbi-surface', ct.surface);
  el.style.setProperty('--orbi-surface-2', ct.surface2);
  el.style.setProperty('--orbi-primary', ct.primary);
  el.style.setProperty('--orbi-secondary', ct.secondary);
  el.style.setProperty('--orbi-text', ct.text);
  el.style.setProperty('--orbi-text-muted', ct.textMuted);
  el.style.setProperty('--orbi-border', ct.border);
}

function clearCustomVars() {
  const el = document.documentElement;
  CUSTOM_VARS.forEach(v => el.style.removeProperty(v));
}

export function OrbiThemeProvider({ children }: { children: ReactNode }) {
  const { setTheme: setAstraTheme } = useAstraTheme();
  const { user } = useAuth();

  const [theme, setThemeState] = useState<OrbiTheme>(
    () => readStored() ?? 'focus',
  );
  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(
    () => readCustomTheme(),
  );

  useEffect(() => {
    applyHtml(theme);
    if (theme === 'custom' && customTheme) {
      applyCustomVars(customTheme);
      setAstraTheme(customTheme.mode === 'light' ? 'light' : 'dark');
    } else {
      clearCustomVars();
      setAstraTheme(theme === 'fresh' ? 'light' : 'dark');
    }
  }, [theme, customTheme, setAstraTheme]);

  useEffect(() => {
    if (!user) return;
    const stored = readStored();
    if (stored) return;
    const prefTheme = user.preferences?.theme;
    if (prefTheme && VALID_THEMES.includes(prefTheme as OrbiTheme)) {
      setThemeState(prefTheme as OrbiTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const setTheme = useCallback((t: OrbiTheme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
    if (t !== 'custom') {
      fetch('/api/users/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme: t }),
      }).catch(() => {});
    }
  }, []);

  const setCustomTheme = useCallback((ct: CustomTheme) => {
    setCustomThemeState(ct);
    try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(ct)); } catch { /* ignore */ }
    setThemeState('custom');
    try { localStorage.setItem(STORAGE_KEY, 'custom'); } catch { /* ignore */ }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useOrbiTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useOrbiTheme must be used inside <OrbiThemeProvider>');
  return ctx;
}
