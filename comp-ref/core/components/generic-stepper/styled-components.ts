/**
 * Styled Components for Generic Stepper
 *
 * Custom styling for stepper-specific UI elements.
 */

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppButton from '../button';

export const StepperContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '400px',

  '&.horizontal': {
    flexDirection: 'column',
  },

  '&.vertical': {
    flexDirection: 'row',
  },
}));

export const StepperHeader = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  position: 'relative',

  '&.vertical': {
    borderBottom: 'none',
    borderRight: `1px solid ${theme.palette.divider}`,
    marginBottom: 0,
    marginRight: theme.spacing(2),
    minWidth: '250px',
  },
}));

export const StepperContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
  maxHeight: 'calc(100vh - 230px)', // Viewport height minus header, tabs, and footer
  minHeight: 'calc(100vh - 230px)',

  // Custom scrollbar styles
  '&::-webkit-scrollbar': {
    width: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '4px',
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.action.disabled,
    borderRadius: '4px',
    transition: 'background-color 0.2s',

    '&:hover': {
      backgroundColor: theme.palette.action.active,
    },
  },

  // Firefox scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.action.disabled} ${theme.palette.action.hover}`,
}));

export const StepperFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 0),
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),

  '& .actions-left': {
    display: 'flex',
    gap: theme.spacing(1),
  },

  '& .actions-right': {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

export const StepIndicator = styled(Box, {
  shouldForwardProp: (prop) =>
    !['isActive', 'isCompleted', 'isEnabled', 'isValid'].includes(prop as string),
})<{
  isActive?: boolean;
  isCompleted?: boolean;
  isEnabled?: boolean;
  isValid?: boolean;
}>(({ theme, isActive, isCompleted, isEnabled, isValid }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  cursor: isEnabled ? 'pointer' : 'not-allowed',
  opacity: isEnabled ? 1 : 0.5,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',

  '&:hover': isEnabled
    ? {
        backgroundColor: theme.palette.action.hover,
      }
    : {},

  ...(isActive && {
    backgroundColor: theme.palette.action.selected,
    fontWeight: 600,
  }),

  '& .step-number': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: isCompleted
      ? theme.palette.success.main
      : isActive
        ? theme.palette.primary.main
        : theme.palette.action.disabled,
    color: isCompleted || isActive ? theme.palette.common.white : theme.palette.text.secondary,
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
  },

  '& .step-label': {
    flex: 1,
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    color: isEnabled ? theme.palette.text.primary : theme.palette.text.disabled,
  },

  '& .step-status': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },

  ...(!isValid &&
    isEnabled && {
      '&::after': {
        content: '""',
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: theme.palette.error.main,
      },
    }),
}));

export const NavigationButton = styled(AppButton)(() => ({
  minWidth: 120,
  textTransform: 'none',
  fontWeight: 500,
}));

export const StepContent = styled(Box)(() => ({
  animation: 'fadeIn 0.3s ease-in-out',

  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));
