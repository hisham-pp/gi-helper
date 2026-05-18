import colors from '@/utils/colors';
import { OwnerStateThemeType } from './button';

const { darkShades, lightShades } = colors;

const Tooltip = () => {
  return {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: ({ theme }: OwnerStateThemeType) => ({
          fontWeight: 400,
          borderRadius: 4,
          fontSize: '12px',
          padding: theme.spacing(1, 1.5),
          backgroundColor: darkShades.charcoalBlue,
          color: lightShades.lightMist,
        }),
        arrow: () => ({
          color: darkShades.charcoalBlue,
        }),
      },
    },
  };
};

export default Tooltip;
