import { Palette } from '@mui/material/styles';
import colors from '@/utils/colors';
import hexToRGBA from '@/utils/hex-to-rgba';

declare module '@mui/material/styles' {
  interface Palette {
    gradients?: {
      primary?: string;
      secondary?: string;
    };
  }
  interface PaletteOptions {
    gradients?: {
      primary?: string;
      secondary?: string;
    };
  }
}

const DefaultPalette = (mode: Palette['mode']) => {
  const { primary, secondary, common, text, lightShades, dander, success } = colors;

  return {
    mode: mode,

    primary: {
      light: hexToRGBA(primary.kieworkBlack, 0.3),
      main: primary.kieworkBlack,
      dark: primary.kieworkBlackDark,
      contrastText: common.white,
    },

    secondary: {
      light: hexToRGBA(secondary.kieworkBlue, 0.5),
      main: secondary.kieworkBlue,
      dark: secondary.kieworkBlueDark,
      contrastText: primary.kieworkBlack,
    },

    gradients: {
      primary: `linear-gradient(to right, ${primary?.kieworkBlack}, ${primary?.kieworkBlackDark})`,
      secondary: `linear-gradient(to right, ${secondary?.kieworkBlue}, ${secondary?.kieworkBlueDark})`,
    },

    text: {
      primary: text.midnightSlate,
      secondary: text.charcoalBlue,
      disabled: text.neutralGray,
    },

    success: {
      light: success.emeraldGreen,
      main: success.forestGreen,
      dark: success.darkOliveGreen,
    },

    error: {
      light: dander.coralRed,
      main: dander.rubyRed,
      dark: dander.cherryWoodRed,
      contrastText: common.white,
    },

    background: {
      paper: common.white,
      default: lightShades.mutedNavy,
    },
  };
};

export default DefaultPalette;
