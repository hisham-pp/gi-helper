import { Box, styled } from '@mui/material';

export const PopupContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 380,
  width: '100%',
}));

export const PopupHeader = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1.5),
}));

export const PopupHeaderTitle = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.primary,
  fontWeight: 600,
}));

export const PopupGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.25),
}));

type PopupItemProps = {
  isActive?: boolean;
};

export const PopupItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<PopupItemProps>(({ theme, isActive }) => ({
  background: isActive
    ? `${theme.palette.primary.main}1A` // 1A = 10% opacity in hex
    : theme.palette.background.paper,
  border: `1px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5, 1.25),
  cursor: 'pointer',
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
  }),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1.5),

  '&:hover': {
    background: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

export const PopupIconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

type PopupItemTitleProps = {
  isActive?: boolean;
};

export const PopupItemTitle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<PopupItemTitleProps>(({ theme, isActive }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.primary,
  fontWeight: isActive ? 600 : 500,
  lineHeight: 1.2,
}));
