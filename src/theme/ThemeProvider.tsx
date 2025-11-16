import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { darkPalette, lightPalette, type ThemePalette } from './palette';

const THEME_STORAGE_KEY = 'sochitieu.theme.preference';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  palette: ThemePalette;
  preference: ThemePreference;
  isDark: boolean;
  toggleTheme: (next?: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light',
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved: string | null) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPreference(saved);
        }
      })
      .catch(() => undefined);
  }, []);

  const isDark = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark';
    }
    return preference === 'dark';
  }, [preference, systemScheme]);

  const palette = useMemo(() => (isDark ? darkPalette : lightPalette), [isDark]);

  const toggleTheme = useCallback(
    async (next?: ThemePreference) => {
      const nextValue: ThemePreference =
        next ?? (preference === 'dark' ? 'light' : 'dark');
      setPreference(nextValue);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextValue);
    },
    [preference],
  );

  const value = useMemo(
    () => ({ palette, preference, isDark, toggleTheme }),
    [palette, preference, isDark, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePalette() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemePalette must be used within ThemeProvider');
  }
  return ctx;
}
