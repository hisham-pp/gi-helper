'use client';

import { ReactNode, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useSettings } from '@/hooks/use-settings';
import Direction from './Direction';
import themeOptions from './themeOptions';

type Props = {
  children: ReactNode;
};

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const { settings } = useSettings();

  const theme = useMemo(() => {
    // Add safety checks to prevent infinite loops
    try {
      if (!settings) {
        return createTheme(themeOptions());
      }
      return createTheme(themeOptions(settings));
    } catch (error) {
      console.error('Error creating theme:', error);
      // Return a minimal theme to avoid further errors
      return createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' },
        },
        typography: { fontSize: 14 },
        shape: { borderRadius: 8 },
      });
    }
  }, [settings]);

  const direction = settings?.language?.dir || 'ltr';

  return (
    <MuiThemeProvider theme={theme}>
      <Direction direction={direction}>
        <CssBaseline />
        {children}
      </Direction>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
