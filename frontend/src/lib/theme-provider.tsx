import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  muiTheme: Theme;
  setTheme: (theme: ThemeMode) => void;
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

// Create emotion cache for SSR compatibility
const cache = createCache({ key: 'css', prepend: true });

const createAppTheme = (mode: ThemeMode): Theme => createTheme({
  palette: {
    mode,
    primary: {
      main: '#5546FF',
      light: '#7C3AED',
      dark: '#4C1D95',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A855F7',
      dark: '#5B21B6',
    },
    background: {
      default: mode === 'dark' ? '#181A20' : '#FFFFFF',
      paper: mode === 'dark' ? '#2C3038' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F5F5F5' : '#212121',
      secondary: mode === 'dark' ? '#A3A3A3' : '#727272',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#3B82F6',
    },
  },
  typography: {
    fontFamily: '"Urbanist", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(85, 70, 255, 0.39)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(85, 70, 255, 0.23)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 15px 0 rgba(85, 70, 255, 0.08)',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'voicify-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (typeof window !== 'undefined' && localStorage.getItem(storageKey) as ThemeMode) || defaultTheme
  );

  const muiTheme = createAppTheme(theme);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const value = {
    theme,
    muiTheme,
    setTheme: (newTheme: ThemeMode) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
    toggleTheme: () =>
      setTheme((prevTheme) => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, newTheme);
        }
        return newTheme;
      }),
  };

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ThemeContext.Provider value={value}>
          {children}
        </ThemeContext.Provider>
      </MuiThemeProvider>
    </CacheProvider>
  );
}
