import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

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
    fontFamily: 'System',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 300,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 300,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 400,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 8px 0 rgba(85, 70, 255, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(85, 70, 255, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px 0 rgba(85, 70, 255, 0.08)',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme);
  const muiTheme = createAppTheme(theme);

  const value = {
    theme,
    muiTheme,
    setTheme: (newTheme: ThemeMode) => {
      setTheme(newTheme);
    },
    toggleTheme: () =>
      setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')),
  };

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}
