/**
 * Stepper Context Provider
 *
 * Provides context for managing stepper state across all step components.
 */

'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Any } from '@/types';
import { StepConfig, StepperContextValue } from './types';

const StepperContext = createContext<StepperContextValue | undefined>(undefined);

export type StepperProviderProps<T = Any> = {
  children: React.ReactNode;
  steps: StepConfig<T>[];
  initialStep?: number;
  initialData?: T;
  onStepChange?: (stepIndex: number, stepKey: string) => void;
  onDataChange?: (data: T) => void;
};

export function StepperProvider<T = Any>({
  children,
  steps,
  initialStep = 0,
  initialData,
  onStepChange,
  onDataChange,
}: StepperProviderProps<T>) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [validationState, setValidationState] = useState<Record<string, boolean>>({});
  const [stateData, setStateData] = useState<T>(initialData || ({} as unknown as T));

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setActiveStep(stepIndex);
        if (onStepChange) {
          onStepChange(stepIndex, steps[stepIndex].key);
        }
      }
    },
    [steps, onStepChange],
  );

  const nextStep = useCallback(() => {
    const nextIndex = activeStep + 1;
    if (nextIndex < steps.length) {
      goToStep(nextIndex);
    }
  }, [activeStep, steps.length, goToStep]);

  const previousStep = useCallback(() => {
    const prevIndex = activeStep - 1;
    if (prevIndex >= 0) {
      goToStep(prevIndex);
    }
  }, [activeStep, goToStep]);

  const canGoNext = useCallback(() => {
    return true;
  }, []);

  const canGoPrevious = useCallback(() => {
    return activeStep > 0;
  }, [activeStep]);

  const updateValidation = useCallback((stepKey: string, isValid: boolean) => {
    setValidationState((prev) => ({
      ...prev,
      [stepKey]: isValid,
    }));
  }, []);

  const updateStateData = useCallback(
    (data: Partial<T>) => {
      setStateData((prev) => {
        const newData = { ...prev, ...data };
        if (onDataChange) {
          onDataChange(newData);
        }
        return newData;
      });
    },
    [onDataChange],
  );

  const resetState = useCallback(() => {
    setActiveStep(initialStep);
    setValidationState({});
    setStateData(initialData || ({} as unknown as T));
  }, [initialStep, initialData]);

  const contextValue = useMemo<StepperContextValue<T>>(
    () => ({
      steps,
      activeStep,
      goToStep,
      nextStep,
      previousStep,
      canGoNext,
      canGoPrevious,
      validationState,
      updateValidation,
      stateData,
      updateStateData,
      resetState,
    }),
    [
      steps,
      activeStep,
      goToStep,
      nextStep,
      previousStep,
      canGoNext,
      canGoPrevious,
      validationState,
      updateValidation,
      stateData,
      updateStateData,
      resetState,
    ],
  );

  return <StepperContext.Provider value={contextValue}>{children}</StepperContext.Provider>;
}

export function useStepper<T = Any>(): StepperContextValue<T> {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context as StepperContextValue<T>;
}
