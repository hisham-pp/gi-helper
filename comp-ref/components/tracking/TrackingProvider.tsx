'use client';

import React, { useEffect } from 'react';
import { useAutoPageTracking } from '@/hooks/useAutoPageTracking';
import { useGlobalEventTracking } from '@/hooks/useGlobalEventTracking';
import { setupApiTracking } from '@/services/apiTracking';
import { mixpanelService } from '@/services/mixpanel';

interface TrackingProviderProps {
  children: React.ReactNode;
  enableAutoTracking?: {
    pageViews?: boolean;
    globalEvents?: boolean;
    apiCalls?: boolean;
    performance?: boolean;
  };
}

// Error Boundary for tracking-related errors
class TrackingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Tracking error (app continues normally):', error);
  }

  render() {
    if (this.state.hasError) {
      // Return children anyway - tracking errors shouldn't break the app
      return this.props.children;
    }
    return this.props.children;
  }
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({
  children,
  enableAutoTracking = {
    pageViews: true,
    globalEvents: true,
    apiCalls: true,
    performance: true,
  },
}) => {
  // Always call hooks (React rules) but pass enabled flag
  try {
    useAutoPageTracking();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Page tracking hook failed:', error);
    }
  }

  try {
    useGlobalEventTracking();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Global event tracking hook failed:', error);
    }
  }

  useEffect(() => {
    try {
      // Setup API tracking interceptor
      if (enableAutoTracking.apiCalls) {
        setupApiTracking();
      }

      // Setup performance tracking
      if (enableAutoTracking.performance) {
        // Track page load performance
        const trackPageLoad = () => {
          try {
            if (typeof window !== 'undefined' && window.performance) {
              const navigation = performance.getEntriesByType(
                'navigation',
              )[0] as PerformanceNavigationTiming;

              mixpanelService.track('Page Load Performance', {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoadedTime:
                  navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstContentfulPaint:
                  performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
                largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]
                  ?.startTime,
              });
            }
          } catch (error) {
            console.warn('Performance tracking failed:', error);
          }
        };

        // Track when page is fully loaded
        if (document.readyState === 'complete') {
          trackPageLoad();
        } else {
          window.addEventListener('load', trackPageLoad);
        }

        // Track visibility changes (user engagement)
        const handleVisibilityChange = () => {
          try {
            mixpanelService.track(document.hidden ? 'Page Hidden' : 'Page Visible', {
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.warn('Visibility tracking failed:', error);
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          window.removeEventListener('load', trackPageLoad);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    } catch (error) {
      console.warn('Tracking setup failed (app continues normally):', error);
    }
  }, [enableAutoTracking]);

  return <TrackingErrorBoundary>{children}</TrackingErrorBoundary>;
};
