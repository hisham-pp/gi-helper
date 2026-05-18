/**
 * Generic Stepper Component Types
 *
 * Type definitions for the reusable stepper component built on top of AppTab.
 */

import { ReactNode } from 'react';
import { BoxProps } from '@mui/material/Box';
import { Any } from '@/types';

export type StepConfig<T = Any> = {
  /** Unique identifier for the step */
  key: string;

  /** Display label for the step (can be a string or React component) */
  label: ReactNode;

  /** Component to render for this step */
  component: React.ComponentType<StepComponentProps<T>>;

  /** Whether this step is enabled/visible */
  enabled: boolean;

  /** Whether this step has been completed */
  completed?: boolean;

  /** Custom validation function for this step */
  validate?: () => boolean | Promise<boolean>;

  /** Optional permission key required to access this step */
  permissionKey?: string;

  /** Optional icon for the step */
  icon?: ReactNode;
};

export type StepComponentProps<T = Any> = {
  /** Current step data */
  data: T;

  /** Function to update step data */
  onDataChange: (data: Partial<T>) => void;

  /** Function to move to next step */
  onNext?: () => void;

  /** Function to move to previous step */
  onPrevious?: () => void;

  /** Whether this is the active step */
  isActive?: boolean;

  /** Whether this step is valid */
  isValid?: boolean;

  /** Validation errors for this step */
  errors?: Record<string, string>;
};

export type StepperContextValue<T = Any> = {
  /** All step configurations */
  steps: StepConfig<T>[];

  /** Current active step index */
  activeStep: number;

  /** Function to navigate to a specific step */
  goToStep: (stepIndex: number) => void;

  /** Function to move to next step */
  nextStep: () => void;

  /** Function to move to previous step */
  previousStep: () => void;

  /** Function to check if can navigate to next step */
  canGoNext: () => boolean;

  /** Function to check if can navigate to previous step */
  canGoPrevious: () => boolean;

  /** Validation state for all steps */
  validationState: Record<string, boolean>;

  /** Function to update validation state for a step */
  updateValidation: (stepKey: string, isValid: boolean) => void;

  /** Complete state data across all steps */
  stateData: T;

  /** Function to update state data */
  updateStateData: (data: Partial<T>) => void;

  /** Function to reset all state */
  resetState: () => void;
};

export type GenericStepperProps<T = Any> = {
  /** Array of step configurations */
  steps: StepConfig<T>[];

  /** Initial step index (default: 0) */
  initialStep?: number;

  /** Whether to allow direct navigation to any step */
  allowDirectNavigation?: boolean;

  /** Whether to allow navigation only to completed steps */
  restrictToCompletedSteps?: boolean;

  /** Initial state data */
  initialData?: T;

  /** Callback when active step changes */
  onStepChange?: (stepIndex: number, stepKey: string) => void;

  /** Callback when stepper is completed (all steps valid) */
  onComplete?: (data: T) => void;

  /** Callback when data changes */
  onDataChange?: (data: T) => void;

  /** Custom container props */
  containerProps?: BoxProps;

  /** Whether to show step numbers */
  showStepNumbers?: boolean;

  /** Whether to show completion indicators */
  showCompletionIndicators?: boolean;

  /** Whether to show navigation buttons */
  showNavigationButtons?: boolean;

  /** Custom next button text */
  nextButtonText?: string;

  /** Custom previous button text */
  previousButtonText?: string;

  /** Custom finish button text (last step) */
  finishButtonText?: string;

  /** Whether the stepper is in loading state */
  loading?: boolean;

  /** Orientation of the stepper (horizontal or vertical) */
  orientation?: 'horizontal' | 'vertical';

  /** Variant style */
  variant?: 'standard' | 'outlined';
  inlineNavigation?: boolean;
};

export type StepNavigationProps = {
  /** Current step index */
  activeStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Whether can navigate to next step */
  canGoNext: boolean;

  /** Whether can navigate to previous step */
  canGoPrevious: boolean;

  /** Function to move to next step */
  onNext: () => void;

  /** Function to move to previous step */
  onPrevious: () => void;

  /** Whether this is the last step */
  isLastStep: boolean;

  /** Custom button texts */
  nextButtonText?: string;
  previousButtonText?: string;
  finishButtonText?: string;

  /** Loading state */
  loading?: boolean;
};

export type StepIndicatorProps = {
  /** Step label (can be a string or React component) */
  label: ReactNode;

  /** Step index */
  index: number;

  /** Whether this step is active */
  isActive: boolean;

  /** Whether this step is completed */
  isCompleted: boolean;

  /** Whether this step is enabled */
  isEnabled: boolean;

  /** Whether this step is valid */
  isValid: boolean;

  /** Function to navigate to this step */
  onClick?: () => void;

  /** Whether to show step number */
  showNumber?: boolean;

  /** Optional icon */
  icon?: ReactNode;
};
