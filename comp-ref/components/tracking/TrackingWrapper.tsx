import React from 'react';
import { useMixpanelTracking } from '@/hooks/useMixpanelTracking';

interface TrackingWrapperProps {
  children: React.ReactElement;
  trackingData: {
    event: string;
    properties?: Record<string, unknown>;
    eventType?: 'click' | 'focus' | 'blur' | 'change';
  };
}

// Safe tracking hook wrapper
const useSafeTracking = () => {
  try {
    return useMixpanelTracking();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Mixpanel tracking hook failed in TrackingWrapper:', error);
    }

    // Return safe no-op functions if tracking fails
    return {
      trackEvent: () => {},
      trackButtonClick: () => {},
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

export const TrackingWrapper: React.FC<TrackingWrapperProps> = ({ children, trackingData }) => {
  const { trackEvent } = useSafeTracking();

  const handleEvent = (originalHandler?: (...args: unknown[]) => unknown) => {
    return (...args: unknown[]) => {
      try {
        trackEvent(trackingData.event, trackingData.properties);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('TrackingWrapper event tracking failed:', error);
        }
      }
      originalHandler?.(...args);
    };
  };

  try {
    const eventProp = `on${trackingData.eventType?.charAt(0).toUpperCase() || 'C'}${
      trackingData.eventType?.slice(1) || 'lick'
    }`;

    // Safe type assertion for children.props
    const childrenProps = (children.props as Record<string, unknown>) || {};

    return React.cloneElement(children, {
      ...childrenProps,
      [eventProp]: handleEvent(
        childrenProps[eventProp] as ((...args: unknown[]) => unknown) | undefined,
      ),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('TrackingWrapper failed to clone element:', error);
    }
    // Return original children if cloning fails
    return children;
  }
};

// Auto-tracking Button wrapper
export const TrackingButton: React.FC<{
  children: React.ReactNode;
  trackingName: string;
  trackingProperties?: Record<string, unknown>;
  [key: string]: unknown;
}> = ({ children, trackingName, trackingProperties, ...props }) => {
  const { trackButtonClick } = useSafeTracking();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      trackButtonClick(trackingName, trackingProperties);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('TrackingButton click tracking failed:', error);
      }
    }
    (props.onClick as React.MouseEventHandler<HTMLButtonElement>)?.(e);
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
};
