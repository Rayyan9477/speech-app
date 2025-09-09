'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../shared/design-system';

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
  // Alias for components expecting `theme` instead of `mode`
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof Typography;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  spacing: typeof Spacing;
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
  if (typeof window === 'undefined') return 'light';
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
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
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem(storageKey) as ThemeMode) || defaultTheme;
  });
  
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemColorScheme());
  
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = createThemeColors(isDark);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update DOM classes and data attributes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    const actualTheme = isDark ? 'dark' : 'light';
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute('data-theme', actualTheme);
  }, [isDark]);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newMode);
    }
  };

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setTheme(nextMode);
  };

  const value: ThemeContextType = {
    mode,
    theme: mode,
    isDark,
    colors,
    typography: Typography,
    borderRadius: BorderRadius,
    shadows: Shadows,
    spacing: Spacing,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
