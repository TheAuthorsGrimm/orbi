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

export type OrbiTheme = 'focus' | 'warm' | 'fresh' | 'high-contrast';

const STORAGE_KEY = 'orbi-theme';
const VALID_THEMES: OrbiTheme[] = ['focus', 'warm', 'fresh', 'high-contrast'];

interface ThemeContextValue {
  theme: OrbiTheme;
  setTheme: (t: OrbiTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): OrbiTheme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && VALID_THEMES.includes(v as OrbiTheme)) return v as OrbiTheme;
  } catch { /* ignore */ }
  return null;
}

function applyHtml(theme: OrbiTheme) {
  document.documentElement.setAttribute('data-orbi-theme', theme);
}

export function OrbiThemeProvider({ children }: { children: ReactNode }) {
  const { setTheme: setAstraTheme } = useAstraTheme();
  const { user } = useAuth();

  const [theme, setThemeState] = useState<OrbiTheme>(
    () => readStored() ?? 'focus',
  );

  // Apply data-orbi-theme + Astra dark/light whenever theme changes
  useEffect(() => {
    applyHtml(theme);
    setAstraTheme(theme === 'fresh' ? 'light' : 'dark');
  }, [theme, setAstraTheme]);

  // Sync from user preferences when the signed-in user changes
  useEffect(() => {
    if (!user) return;
    const stored = readStored();
    if (stored) return; // localStorage wins over API value
    const prefTheme = user.preferences?.theme;
    if (prefTheme && VALID_THEMES.includes(prefTheme as OrbiTheme)) {
      setThemeState(prefTheme as OrbiTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const setTheme = useCallback((t: OrbiTheme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
    fetch('/api/users/me/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ theme: t }),
    }).catch(() => { /* graceful — localStorage is the source of truth */ });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useOrbiTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useOrbiTheme must be used inside <OrbiThemeProvider>');
  return ctx;
}
