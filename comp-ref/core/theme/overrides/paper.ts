import hexToRGBA from '@/utils/hex-to-rgba';
import { OwnerStateThemeType } from './button';

const Paper = () => {
  return {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          boxShadow: `0 2px 4px 0 ${hexToRGBA(theme.palette.primary.main, 0.4)}`,
          borderRadius: theme.shape.borderRadius,
        }),
        elevation0: ({ theme }: OwnerStateThemeType) => ({
          boxShadow: theme.shadows[0],
        }),
        elevation1: ({ theme }: OwnerStateThemeType) => ({
          boxShadow: theme.shadows[3],
        }),
        elevation2: ({ theme }: OwnerStateThemeType) => ({
          boxShadow: theme.shadows[4],
        }),
      },
    },
  };
};

export default Paper;
