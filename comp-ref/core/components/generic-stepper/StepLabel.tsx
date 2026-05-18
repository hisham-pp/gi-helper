/**
 * Step Label Component with Number and Completion Indicator
 *
 * Displays a step label with:
 * - Dynamic step number
 * - Completion check icon for completed steps
 * - Active state styling
 * - Validation error indicator
 */

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Icon from '../icon';

type StepLabelProps = {
  /** Step label text or component */
  label: React.ReactNode;

  /** Step number (1-based) */
  stepNumber: number;

  /** Whether this step is active */
  isActive: boolean;

  /** Whether this step is completed */
  isCompleted: boolean;

  /** Whether this step is valid */
  isValid: boolean;
};

const StepLabelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  width: '100%',
}));

const StepNumberCircle = styled(Box, {
  shouldForwardProp: (prop) => !['isActive', 'isCompleted'].includes(prop as string),
})<{ isActive?: boolean; isCompleted?: boolean }>(({ theme, isActive, isCompleted }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  minWidth: 24,
  borderRadius: '50%',
  backgroundColor: isCompleted
    ? theme.palette.success.main
    : isActive
      ? theme.palette.primary.main
      : theme.palette.grey[300],
  color: isCompleted || isActive ? theme.palette.common.white : theme.palette.text.secondary,
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
}));

const StepLabelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  fontSize: '14px',
  fontWeight: isActive ? 600 : 400,
  color: theme.palette.text.primary,
  flex: 1,
}));

const ValidationErrorDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.error.main,
  marginLeft: 'auto',
}));

function StepLabel({ label, stepNumber, isActive, isCompleted, isValid }: StepLabelProps) {
  return (
    <StepLabelContainer>
      <StepNumberCircle isActive={isActive} isCompleted={isCompleted}>
        {isCompleted ? <Icon icon='eva:checkmark-outline' width={18} height={18} /> : stepNumber}
      </StepNumberCircle>
      <StepLabelText isActive={isActive}>{label}</StepLabelText>
      {!isValid && !isActive && <ValidationErrorDot />}
    </StepLabelContainer>
  );
}

export default memo(StepLabel);
