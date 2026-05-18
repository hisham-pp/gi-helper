import { ThemeOptions } from '@mui/material/styles';
import { Any } from '@/types';
import overrides from './overrides';
import palette from './palette';
import shadows from './shadows';
import spacing from './spacing';
import typography from './typography';

interface Shape {
  borderRadiusSmall: number;
  borderRadiusMedium: number;
  borderRadius: number;
  borderRadiusLarge: number;
  borderRadiusExtraLarge: number;
}

interface NumberValue {
  small: number;
  medium: number;
  large: number;
}

interface StringValue {
  small: string;
  medium: string;
  large: string;
}

interface InputConfig {
  height: NumberValue;
  minWidth: NumberValue;
  padding: StringValue;
  label: {
    fontSize: StringValue;
  };
  fontSize: StringValue;
}

declare module '@mui/material/styles' {
  interface Theme {
    shape: Shape;
    inputs: InputConfig;
  }

  interface ThemeOptions {
    shape: Shape;
    inputs: InputConfig;
  }
}

const borderRadius = {
  borderRadiusSmall: 8,
  borderRadiusMedium: 20,
  borderRadiusLarge: 30,
  borderRadiusExtraLarge: 50,
};

const inputConfig = {
  height: {
    small: 40,
    medium: 44,
    large: 48,
  },
  minWidth: {
    small: 120,
    medium: 200,
    large: 280,
  },
  padding: {
    small: '8.5px 14px',
    medium: '10px 14px',
    large: '12px 14px',
  },
  label: {
    fontSize: {
      small: '0.9rem', // 16px (MUI default, scales down when shrunk)
      medium: '1rem', // 16px
      large: '1.125rem', // 18px
    },
  },
  fontSize: {
    small: '0.875rem', // 14px
    medium: '1rem', // 16px
    large: '1.125rem', // 18px
  },
};

const themeOptions = (settings?: Any): ThemeOptions => {
  const mode = settings?.mode || 'light';
  try {
    const themeConfig = {
      components: overrides(),
      palette: palette(mode),
      typography: typography,
      shadows: shadows(),
      shape: {
        borderRadius: borderRadius.borderRadiusMedium,
        borderRadiusSmall: borderRadius.borderRadiusSmall,
        borderRadiusMedium: borderRadius.borderRadiusMedium,
        borderRadiusLarge: borderRadius.borderRadiusLarge,
        borderRadiusExtraLarge: borderRadius.borderRadiusExtraLarge,
      },
      inputs: inputConfig,
      ...spacing,
    };

    return themeConfig as ThemeOptions;
  } catch (error) {
    console.error('Error in themeOptions:', error);
    // Return a minimal theme if there's an error
    return {
      palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
      },
      typography: { fontSize: 14 },
      shape: {
        borderRadius: borderRadius.borderRadiusMedium,
        borderRadiusSmall: borderRadius.borderRadiusSmall,
        borderRadiusMedium: borderRadius.borderRadiusMedium,
        borderRadiusLarge: borderRadius.borderRadiusLarge,
        borderRadiusExtraLarge: borderRadius.borderRadiusExtraLarge,
      },
      inputs: inputConfig,
    } satisfies ThemeOptions;
  }
};

export default themeOptions;
