import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, type ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import { darkPalette, lightPalette, type ThemePalette } from '@/theme/palette';

const THEME_STORAGE_KEY = 'sochitieu.theme.preference';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  palette: ThemePalette;
  preference: ThemePreference;
  systemScheme: ColorSchemeName;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => Promise<void>;
  setSystemScheme: (scheme: ColorSchemeName) => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  palette: lightPalette,
  preference: 'system',
  systemScheme: Appearance.getColorScheme() ?? 'light',
  isDark: false,

  setSystemScheme: (scheme: ColorSchemeName) => {
    set({ systemScheme: scheme });
    const { preference } = get();
    const isDark =
      preference === 'system' ? scheme === 'dark' : preference === 'dark';
    set({
      isDark,
      palette: isDark ? darkPalette : lightPalette,
    });
  },

  setPreference: async (pref: ThemePreference) => {
    set({ preference: pref });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
    const { systemScheme } = get();
    const isDark =
      pref === 'system' ? systemScheme === 'dark' : pref === 'dark';
    set({
      isDark,
      palette: isDark ? darkPalette : lightPalette,
    });
  },

  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        const { systemScheme } = get();
        const isDark =
          saved === 'system' ? systemScheme === 'dark' : saved === 'dark';
        set({
          preference: saved,
          isDark,
          palette: isDark ? darkPalette : lightPalette,
        });
      }
    } catch {
      // ignore
    }
  },
}));

// Setup appearance listener
Appearance.addChangeListener(({ colorScheme }) => {
  useThemeStore.getState().setSystemScheme(colorScheme ?? 'light');
});
