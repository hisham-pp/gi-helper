import React from 'react';
import {
  Box,
  Chip,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import { OnboardingStep } from '@/types/master/company-onboarding';

export interface OnboardingProgressProps {
  steps: OnboardingStep[];
  activeStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      return 'completed';
    }
    if (stepId === activeStep) {
      return 'active';
    }
    return 'pending';
  };

  const getStepColor = (
    step: OnboardingStep,
    status: string,
  ): 'error' | 'warning' | 'success' | 'primary' | 'inherit' => {
    if (step.hasErrors) {
      return 'error';
    }
    if (step.hasWarnings) {
      return 'warning';
    }
    if (status === 'completed') {
      return 'success';
    }
    if (status === 'active') {
      return 'primary';
    }
    return 'inherit';
  };

  const getStepOpacity = (status: string) => {
    if (status === 'pending') {
      return 0.6;
    }
    return 1;
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        padding: isSmallScreen ? '12px' : '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: theme.shadows[1],
      }}
    >
      <Stepper
        activeStep={activeStep}
        orientation={isSmallScreen ? 'vertical' : 'horizontal'}
        sx={{
          '& .MuiStepConnector-root': {
            opacity: 0.5,
          },
          '& .MuiStepConnector-active': {
            '& .MuiStepConnector-line': {
              borderColor: theme.palette.primary.main,
            },
          },
          '& .MuiStepLabel-label': {
            fontSize: isSmallScreen ? '12px' : '13px',
            opacity: getStepOpacity(status),
          },
        }}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = true; // Allow clicking any step

          return (
            <Step key={step.id} completed={completedSteps.includes(step.id)}>
              <StepLabel
                onClick={() => onStepClick(step.id)}
                sx={{
                  cursor: 'pointer',
                  opacity: getStepOpacity(status),
                  '& .MuiStepIcon-root': {
                    color: (() => {
                      const color = getStepColor(step, status);
                      return color === 'inherit'
                        ? 'inherit'
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (theme.palette[color as keyof typeof theme.palette] as any).main;
                    })(),
                    fontSize: isSmallScreen ? '24px' : '28px',
                  },
                  '& .MuiStepIcon-text': {
                    fontWeight: 600,
                  },
                  '&:hover': isClickable
                    ? {
                        backgroundColor: theme.palette.action.hover,
                        borderRadius: '4px',
                      }
                    : {},
                }}
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isSmallScreen ? '24px' : '28px',
                      height: isSmallScreen ? '24px' : '28px',
                      borderRadius: '50%',
                      backgroundColor:
                        status === 'completed'
                          ? theme.palette.success.light
                          : status === 'active'
                            ? theme.palette.primary.light
                            : theme.palette.grey[200],
                      color:
                        status === 'completed'
                          ? theme.palette.success.main
                          : status === 'active'
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                      fontSize: isSmallScreen ? '14px' : '16px',
                      fontWeight: 600,
                    }}
                  >
                    {status === 'completed' ? (
                      <Icon icon='mdi:check' fontSize='small' />
                    ) : (
                      index + 1
                    )}
                  </Box>
                )}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'space-between',
                    width: isSmallScreen ? '100%' : 'auto',
                  }}
                >
                  <span>{step.label}</span>
                  {step.hasErrors && (
                    <Chip label='Error' size='small' color='error' variant='filled' />
                  )}
                  {step.hasWarnings && !step.hasErrors && (
                    <Chip label='Warning' size='small' color='warning' variant='filled' />
                  )}
                  {completedSteps.includes(step.id) && !step.hasErrors && (
                    <Chip label='Done' size='small' color='success' variant='filled' />
                  )}
                </Box>
              </StepLabel>
              {isSmallScreen && <StepContent />}
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default OnboardingProgress;
