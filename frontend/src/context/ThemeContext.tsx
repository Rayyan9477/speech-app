import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '../../../shared/design-system';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  // Alias for backwards compatibility with components expecting `theme`
  theme: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const createThemeColors = (isDark: boolean): ThemeColors => ({
  primary: Colors.primary[500],
  primaryLight: Colors.primary[400],
  primaryDark: Colors.primary[600],
  secondary: Colors.secondary[500],
  background: isDark ? Colors.dark.background : Colors.light.background,
  surface: isDark ? Colors.dark.surface : Colors.light.surface,
  card: isDark ? Colors.dark.card : Colors.light.card,
  border: isDark ? Colors.dark.border : Colors.light.border,
  text: {
    primary: isDark ? Colors.dark.text.primary : Colors.light.text.primary,
    secondary: isDark ? Colors.dark.text.secondary : Colors.light.text.secondary,
    tertiary: isDark ? Colors.dark.text.tertiary : Colors.light.text.tertiary,
  },
  success: Colors.success[500],
  warning: Colors.warning[500],
  error: Colors.error[500],
  info: Colors.primary[500],
});

const STORAGE_KEY = 'voicify-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemColorScheme());
  
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = createThemeColors(isDark);

  // Load saved theme preference on app start
  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };
    loadTheme();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemScheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Update CSS custom properties
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-surface', colors.surface);
      root.style.setProperty('--color-card', colors.card);
      root.style.setProperty('--color-border', colors.border);
      root.style.setProperty('--color-text-primary', colors.text.primary);
      root.style.setProperty('--color-text-secondary', colors.text.secondary);
      root.style.setProperty('--color-text-tertiary', colors.text.tertiary);
      root.style.setProperty('--color-success', colors.success);
      root.style.setProperty('--color-warning', colors.warning);
      root.style.setProperty('--color-error', colors.error);
      
      // Update document class
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    }
  }, [colors, isDark]);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setTheme(nextMode);
  };

  const value: ThemeContextType = {
    mode,
    isDark,
    colors,
    theme: colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}