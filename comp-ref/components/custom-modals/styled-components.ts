import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

export const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'containerWidth',
})<{ containerWidth?: number }>(({ theme, containerWidth }) => ({
  minWidth: 440,
  minHeight: 280,
  width: containerWidth,
  background: colors.lightShades.mutedNavy,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '.9rem',

  '& .exclamation': {
    marginTop: theme.spacing(4),
  },

  '& .title': {
    fontSize: 18,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
  },

  '& .delete-confirmation': {
    fontSize: 16,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },

  '& .confirmation-container': {
    flexGrow: 1,
    fontSize: 14,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '6px',
    width: '80%',
  },

  '& .button-wrapper': {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),

    '& button': {
      minWidth: 90,
    },
  },
}));
