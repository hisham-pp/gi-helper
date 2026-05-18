import { OwnerStateThemeType } from './button';

const Card = () => {
  return {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: OwnerStateThemeType) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
  };
};

export default Card;
