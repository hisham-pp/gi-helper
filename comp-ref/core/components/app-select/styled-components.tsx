import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const CountBadge = styled(Box)(({ theme }) => ({
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
}));

export const CheckOption = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isFocused',
})<{ isFocused?: boolean }>(({ theme, isFocused }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  minHeight: 40,
  cursor: 'pointer',
  backgroundColor: isFocused ? theme.palette.action.hover : 'transparent',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
