import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import hexToRGBA from '@/utils/hex-to-rgba';

export const ButtonTrack = styled(Card)(({ theme }) => ({
  backgroundColor: hexToRGBA(theme.palette.primary.main, 0.2),
  minWidth: 60,
  maxWidth: 70,
  minHeight: 40,
  maxHeight: 40,
  display: 'flex',
  alignItems: 'center',
  padding: 3,

  '& button': {
    borderRadius: 7,
  },

  '& svg': {
    color: theme.palette.primary.main,
  },
}));
