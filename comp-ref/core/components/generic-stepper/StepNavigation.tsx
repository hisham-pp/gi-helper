'use client';

import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { NavigationButton, StepperFooter } from './styled-components';
import { StepNavigationProps } from './types';

const StepNavigation = ({
  activeStep,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  isLastStep,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  finishButtonText = 'Finish',
  loading = false,
}: StepNavigationProps) => {
  return (
    <StepperFooter>
      <Box className='actions-left'>
        {canGoPrevious && (
          <NavigationButton variant='outlined' onClick={onPrevious} disabled={loading}>
            {previousButtonText}
          </NavigationButton>
        )}
      </Box>

      <Typography variant='body2' color='text.secondary'>
        Step {activeStep + 1} of {totalSteps}
      </Typography>
      <Box className='actions-right'>
        {!isLastStep && (
          <NavigationButton
            variant='contained'
            onClick={onNext}
            disabled={!canGoNext || loading}
            endIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {nextButtonText}
          </NavigationButton>
        )}

        {isLastStep && (
          <NavigationButton
            variant='contained'
            color='primary'
            onClick={onNext}
            disabled={!canGoNext || loading}
            endIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {finishButtonText}
          </NavigationButton>
        )}
      </Box>
    </StepperFooter>
  );
};

export default memo(StepNavigation);
