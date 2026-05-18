import React from 'react';
import { Button, ButtonProps, Fab, FabProps, TextField, TextFieldProps } from '@mui/material';
import { useMixpanelTracking } from '@/hooks/useMixpanelTracking';

// Safe tracking function that never throws or breaks component functionality
const useSafeTracking = () => {
  try {
    return useMixpanelTracking();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Mixpanel tracking hook failed, using safe fallbacks:', error);
    }

    // Return safe no-op functions if tracking fails
    return {
      trackButtonClick: () => {},
      trackEvent: () => {},
      trackFormSubmit: () => {},
      trackFormError: () => {},
      trackNavigationClick: () => {},
      trackFeatureUsage: () => {},
      trackApiCall: () => {},
      trackFileAction: () => {},
      trackModalAction: () => {},
      trackSearch: () => {},
    };
  }
};

// Tracked Button Component
interface TrackedButtonProps extends ButtonProps {
  trackingName?: string;
  trackingProperties?: Record<string, unknown>;
  autoTrack?: boolean;
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({
  children,
  trackingName,
  trackingProperties = {},
  autoTrack = true,
  onClick,
  ...props
}) => {
  const { trackButtonClick } = useSafeTracking();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      if (autoTrack) {
        const buttonText = typeof children === 'string' ? children : 'Button';
        trackButtonClick(trackingName || buttonText, {
          variant: props.variant,
          color: props.color,
          size: props.size,
          ...trackingProperties,
        });
      }
    } catch (error) {
      // Tracking error should never break button functionality
      if (process.env.NODE_ENV === 'development') {
        console.warn('Button tracking failed:', error);
      }
    }

    onClick?.(event);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
};

// Tracked TextField Component
interface TrackedTextFieldProps extends Omit<TextFieldProps, 'onFocus' | 'onChange'> {
  trackingName?: string;
  trackFocus?: boolean;
  trackChange?: boolean;
  onFocus?: TextFieldProps['onFocus'];
  onChange?: TextFieldProps['onChange'];
}

export const TrackedTextField: React.FC<TrackedTextFieldProps> = ({
  trackingName,
  trackFocus = true,
  trackChange = false,
  onFocus,
  onChange,
  ...props
}) => {
  const { trackEvent } = useSafeTracking();

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    try {
      if (trackFocus) {
        trackEvent('Form Field Focus', {
          fieldName: trackingName || props.name || props.id || 'Unknown Field',
          fieldType: props.type || 'text',
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('TextField focus tracking failed:', error);
      }
    }
    onFocus?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (trackChange) {
        trackEvent('Form Field Change', {
          fieldName: trackingName || props.name || props.id || 'Unknown Field',
          fieldType: props.type || 'text',
          hasValue: !!event.target.value,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('TextField change tracking failed:', error);
      }
    }
    onChange?.(event);
  };

  return <TextField {...props} onFocus={handleFocus} onChange={handleChange} />;
};

// Tracked FAB Component
interface TrackedFabProps extends FabProps {
  trackingName?: string;
  trackingProperties?: Record<string, unknown>;
}

export const TrackedFab: React.FC<TrackedFabProps> = ({
  children,
  trackingName = 'FAB',
  trackingProperties = {},
  onClick,
  ...props
}) => {
  const { trackButtonClick } = useSafeTracking();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      trackButtonClick(trackingName, {
        variant: props.variant,
        color: props.color,
        size: props.size,
        ...trackingProperties,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('FAB tracking failed:', error);
      }
    }
    onClick?.(event);
  };

  return (
    <Fab {...props} onClick={handleClick}>
      {children}
    </Fab>
  );
};
