import PaginationItem from '@mui/material/PaginationItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const StyledPaginationItem = styled(PaginationItem)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    userSelect: 'none',
    minWidth: 28,
    height: 28,
    fontSize: 13,

    ...(selected && {
      background: theme.palette.gradients?.primary,
      color: theme.palette.primary.contrastText,
    }),
  }),
);

export const PageNavButton = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: 12,

  ...(!disabled && {
    background: theme.palette.gradients?.primary,
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  }),

  '& svg': {
    fontSize: 16,
    color: theme.palette.primary.main,

    ...(!disabled && {
      color: theme.palette.primary.main,
    }),
  },
}));
