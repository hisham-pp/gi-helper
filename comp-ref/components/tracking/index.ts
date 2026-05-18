// Auto-tracking components
export { TrackedButton, TrackedFab, TrackedTextField } from './TrackedComponents';
export { TrackingProvider } from './TrackingProvider';
export { TrackingButton, TrackingWrapper } from './TrackingWrapper';

// Auto-tracking hooks
export { useAutoPageTracking } from '@/hooks/useAutoPageTracking';
export { useGlobalEventTracking } from '@/hooks/useGlobalEventTracking';

// API tracking setup
export { setupApiTracking } from '@/services/apiTracking';

// Re-export existing tracking utilities
export { MIXPANEL_EVENTS } from '@/constants/mixpanelEvents';
export { useMixpanelTracking } from '@/hooks/useMixpanelTracking';
export { mixpanelService } from '@/services/mixpanel';
