import { ComponentsPropsList, Theme } from '@mui/material/styles';

export type OwnerStateThemeType = {
  theme: Theme;
  ownerState: ComponentsPropsList[keyof ComponentsPropsList] & Record<string, unknown>;
};

const Button = () => {
  return {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme }: OwnerStateThemeType) => ({
          fontWeight: theme.typography.fontWeightMedium,
          lineHeight: '24px',
          letterSpacing: '0.3px',
          textTransform: 'none',
          boxShadow: 'none',
          borderRadius: theme.shape.borderRadius,

          ...(ownerState.size === 'medium' &&
            ownerState.variant === 'text' && {
              padding: theme.spacing(1.5, 4), // Reduced horizontal padding
            }),
          '&:not(.MuiButtonGroup-grouped)': {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        }),
        contained: ({ theme }: OwnerStateThemeType) => ({
          padding: theme.spacing(1.5, 4), // Reduced horizontal padding (was 1.75, 5)
          color: theme.palette.common.white,
        }),
        containedPrimary: ({ theme }: OwnerStateThemeType) => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {
            background: theme.palette.gradients?.primary,
          },
        }),
        containedSecondary: () => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {},
        }),
        containedSuccess: () => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {},
        }),
        containedError: () => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {},
        }),
        containedWarning: () => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {},
        }),
        containedInfo: () => ({
          '&:not(.Mui-disabled), &.MuiButtonGroup-grouped:not(.Mui-disabled)': {},
        }),
        outlined: ({ theme }: OwnerStateThemeType) => ({
          padding: theme.spacing(1.25, 3.75), // Reduced horizontal padding (was 1.5, 4.75)
        }),
        sizeSmall: ({ theme, ownerState }: OwnerStateThemeType) => ({
          borderRadius: theme.shape.borderRadius,
          ...(ownerState.variant === 'text' && {
            padding: theme.spacing(1.5, 3.5),
          }),
          ...(ownerState.variant === 'contained' && {
            padding: theme.spacing(1.5, 3.5),
          }),
          ...(ownerState.variant === 'outlined' && {
            padding: theme.spacing(1.25, 3.25),
          }),
        }),
        sizeLarge: ({ theme, ownerState }: OwnerStateThemeType) => ({
          borderRadius: theme.shape.borderRadius,
          ...(ownerState.variant === 'text' && {
            padding: theme.spacing(2.5, 6.5),
          }),
          ...(ownerState.variant === 'contained' && {
            padding: theme.spacing(2.5, 6.5),
          }),
          ...(ownerState.variant === 'outlined' && {
            padding: theme.spacing(1.75, 6.25),
          }),
        }),
      },
    },
  };
};

export default Button;
