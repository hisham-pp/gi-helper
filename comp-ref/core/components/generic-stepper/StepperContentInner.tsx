import React, { memo, useCallback, useMemo, useState } from 'react';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { Any } from '@/types';
import AppTab from '../app-tab';
import Icon from '../icon';
import StepLabel from './StepLabel';
import StepNavigation from './StepNavigation';
import { useStepper } from './StepperContext';
import { NavigationButton, StepperContent } from './styled-components';
import { GenericStepperProps } from './types';

function StepperContentInner<T = Any>({
  showNavigationButtons = true,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  finishButtonText = 'Finish',
  loading = false,
  onComplete,
  inlineNavigation = false,
}: Pick<
  GenericStepperProps<T>,
  | 'showNavigationButtons'
  | 'nextButtonText'
  | 'previousButtonText'
  | 'finishButtonText'
  | 'loading'
  | 'onComplete'
  | 'inlineNavigation'
>) {
  const {
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
  } = useStepper<T>();

  const [isValidating, setIsValidating] = useState(false);

  const enabledSteps = useMemo(() => steps.filter((step) => step.enabled), [steps]);

  const currentStepConfig = enabledSteps[activeStep];
  const isLastStep = activeStep === enabledSteps.length - 1;

  const handleTabChange = useCallback(
    async (tabIndex: number) => {
      if (isValidating || tabIndex === activeStep) {
        return;
      }

      // Allow backward navigation without validation
      if (tabIndex < activeStep) {
        goToStep(tabIndex);
        return;
      }

      // For forward navigation, validate all steps from activeStep to tabIndex - 1
      if (tabIndex > activeStep) {
        setIsValidating(true);
        try {
          let hasValidationError = false;

          // Validate all intermediate steps
          for (let i = activeStep; i < tabIndex; i++) {
            const stepToValidate = enabledSteps[i];
            if (stepToValidate?.validate) {
              const isValid = await stepToValidate.validate();
              updateValidation(stepToValidate.key, isValid);

              if (!isValid) {
                hasValidationError = true;
                // Don't break - continue validating all steps to show all errors
              }
            }
          }

          if (hasValidationError) {
            // Navigate to the last step (Review & Save) to show validation errors
            const reviewStepIndex = enabledSteps.length - 1;
            goToStep(reviewStepIndex);
            return;
          }

          // All validations passed, navigate to target tab
          goToStep(tabIndex);
        } finally {
          setIsValidating(false);
        }
        return;
      }

      goToStep(tabIndex);
    },
    [activeStep, enabledSteps, goToStep, updateValidation, isValidating],
  );

  const handleNext = useCallback(async () => {
    if (!currentStepConfig) return;

    if (currentStepConfig.validate) {
      const isValid = await currentStepConfig.validate();
      updateValidation(currentStepConfig.key, isValid);

      if (!isValid) {
        return;
      }
    }

    if (isLastStep && onComplete) {
      onComplete(stateData);
    } else {
      nextStep();
    }
  }, [currentStepConfig, isLastStep, nextStep, updateValidation, stateData, onComplete]);

  const tabsData = useMemo(
    () =>
      enabledSteps.map((step, index) => ({
        label: (
          <StepLabel
            label={step.label}
            stepNumber={index + 1}
            isActive={index === activeStep}
            isCompleted={step.completed ?? false}
            isValid={validationState[step.key] !== false}
          />
        ),
        disabled: false,
        permissionKey: step.permissionKey,
        content: (
          <StepperContent key={step.key}>
            {React.createElement(step.component, {
              data: stateData,
              onDataChange: updateStateData,
              onNext: handleNext,
              onPrevious: previousStep,
              isActive: index === activeStep,
              isValid: validationState[step.key] !== false,
              errors: {},
            })}
          </StepperContent>
        ),
      })),
    [
      enabledSteps,
      stateData,
      updateStateData,
      handleNext,
      previousStep,
      activeStep,
      validationState,
    ],
  );

  if (inlineNavigation) {
    const navigationDisabled = isValidating || loading;
    const canGoBack = canGoPrevious();

    return (
      <>
        <Stack
          direction='row'
          alignItems='stretch'
          sx={(theme) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tabs
              variant='scrollable'
              scrollButtons={false}
              value={activeStep}
              onChange={(_, value) => handleTabChange(value as number)}
              indicatorColor='primary'
              textColor='primary'
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  py: 1,
                  px: 1.25,
                  alignItems: 'center',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 999,
                },
              }}
            >
              {enabledSteps.map((step, index) => (
                <Tab
                  key={step.key}
                  disableRipple
                  label={
                    <StepLabel
                      label={step.label}
                      stepNumber={index + 1}
                      isActive={index === activeStep}
                      isCompleted={step.completed ?? false}
                      isValid={validationState[step.key] !== false}
                    />
                  }
                />
              ))}
            </Tabs>
          </Box>
          <Stack
            direction='row'
            alignItems='center'
            gap={0.75}
            sx={(theme) => ({
              flexShrink: 0,
              pl: 1,
              ml: 1,
              borderLeft: `1px solid ${theme.palette.divider}`,
            })}
          >
            <NavigationButton
              variant='text'
              size='small'
              disabled={!canGoBack || navigationDisabled}
              onClick={previousStep}
              aria-label={previousButtonText}
              sx={{
                minWidth: 36,
                width: 36,
                height: 36,
                p: 0,
                borderRadius: 999,
              }}
            >
              <Icon icon='material-symbols:chevron-left-rounded' fontSize={20} />
            </NavigationButton>
            <NavigationButton
              variant='contained'
              color='primary'
              size='small'
              disabled={!canGoNext() || navigationDisabled}
              onClick={handleNext}
              endIcon={
                navigationDisabled ? (
                  <CircularProgress size={14} color='inherit' />
                ) : (
                  <Icon
                    icon={
                      isLastStep
                        ? 'material-symbols:check-circle-outline'
                        : 'material-symbols:chevron-right-rounded'
                    }
                    fontSize={18}
                  />
                )
              }
            >
              {isLastStep ? finishButtonText : nextButtonText}
            </NavigationButton>
          </Stack>
        </Stack>
        <StepperContent key={currentStepConfig?.key}>
          {currentStepConfig
            ? React.createElement(currentStepConfig.component, {
                data: stateData,
                onDataChange: updateStateData,
                onNext: handleNext,
                onPrevious: previousStep,
                isActive: true,
                isValid: validationState[currentStepConfig.key] !== false,
                errors: {},
              })
            : null}
        </StepperContent>
      </>
    );
  }

  return (
    <>
      <AppTab
        tabs={tabsData}
        activeTab={activeStep}
        onTabChange={handleTabChange}
        orientation='horizontal'
        variant='standard'
        panelContainerProps={{ sx: { padding: 0 } }}
      />

      {showNavigationButtons && (
        <StepNavigation
          activeStep={activeStep}
          totalSteps={enabledSteps.length}
          canGoNext={canGoNext()}
          canGoPrevious={canGoPrevious()}
          onNext={handleNext}
          onPrevious={previousStep}
          isLastStep={isLastStep}
          nextButtonText={nextButtonText}
          previousButtonText={previousButtonText}
          finishButtonText={finishButtonText}
          loading={loading}
        />
      )}
    </>
  );
}

export default memo(StepperContentInner) as unknown as typeof StepperContentInner<Any>;
