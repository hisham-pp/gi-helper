'use client';

import React, { memo } from 'react';
import { Any } from '@/types';
import StepperContentInner from './StepperContentInner';
import { StepperProvider } from './StepperContext';
import { StepperContainer } from './styled-components';
import { GenericStepperProps } from './types';

function GenericStepper<T = Any>(props: GenericStepperProps<T>) {
  const {
    steps,
    initialStep = 0,
    initialData,
    onStepChange,
    onDataChange,
    onComplete,
    containerProps = {},
    showNavigationButtons = true,
    nextButtonText,
    previousButtonText,
    finishButtonText,
    loading = false,
    orientation = 'horizontal',
    inlineNavigation = false,
  } = props;

  return (
    <StepperProvider
      steps={steps}
      initialStep={initialStep}
      initialData={initialData}
      onStepChange={onStepChange}
      onDataChange={onDataChange}
    >
      <StepperContainer className={orientation} {...containerProps}>
        <StepperContentInner
          showNavigationButtons={showNavigationButtons}
          nextButtonText={nextButtonText}
          previousButtonText={previousButtonText}
          finishButtonText={finishButtonText}
          loading={loading}
          onComplete={onComplete}
          inlineNavigation={inlineNavigation}
        />
      </StepperContainer>
    </StepperProvider>
  );
}

export { default as StepLabel } from './StepLabel';
export { useStepper } from './StepperContext';
export type { GenericStepperProps, StepComponentProps, StepConfig } from './types';
export default memo(GenericStepper) as typeof GenericStepper;
