import { usePathname } from 'next/navigation';
import { memo, useCallback, useContext, useMemo } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import navItems from '@/constant/nav-items';
import { ROUTES } from '@/constant/routes';
import { SettingsContext } from '@/context/SettingsContext';
import Icon from '@/core/components/icon';
import useResponsive from '@/hooks/use-responsive';
import { useSettings } from '@/hooks/use-settings';
import AppLogo from '../shared/AppLogo';
import type { NavGroup as NavGroupType } from '../types';
import {
  SidebarFooter,
  SidebarHeader,
  SidebarToggle,
  VerticalNavContainer,
} from './nav/styled-components';
import Nav from './nav';

// Constants for nav widths
export const NAV_WIDTH_COLLAPSED = 64;
export const NAV_WIDTH_COLLAPSED_MOBILE = 48;
export const NAV_WIDTH_EXPANDED = 250;

// Header height (mobile vs desktop)
export const HEADER_HEIGHT = 64;
export const HEADER_HEIGHT_MOBILE = 52;

const AppLayout = () => {
  const {
    chatbot: {
      root: { path },
      employeeEngagement: { path: employeeEngagementPath },
    },
  } = ROUTES;
  const { t } = useTranslation();
  const theme = useTheme();
  const pathname = usePathname();
  const { settings, saveSettings } = useSettings();
  const { selectedNavId } = useContext(SettingsContext);
  const { isMobile } = useResponsive();
  const shouldShowNav = !(isMobile && (pathname === path || pathname === employeeEngagementPath));

  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isRTL = theme.direction === 'rtl';

  // Find the selected nav item for displaying current module
  const selectedNavItem = useMemo(() => {
    if (selectedNavId !== null) {
      return navItems.find((item) => item.id === selectedNavId);
    }
    // Fallback: find from pathname
    for (const item of navItems) {
      if (item.path && pathname.startsWith(item.path)) {
        return item;
      }
      if ((item as NavGroupType).children?.length) {
        const matchingChild = (item as NavGroupType).children?.find(
          (child) => child.path && pathname.startsWith(child.path),
        );
        if (matchingChild) {
          return item;
        }
      }
    }
    return null;
  }, [selectedNavId, pathname]);

  // Handle backdrop click to close sidebar on mobile
  const handleBackdropClick = useCallback(() => {
    saveSettings({ ...settings, navCollapsed: true });
  }, [saveSettings, settings]);

  // Handle toggle click - works on all devices
  const handleToggleClick = useCallback(() => {
    saveSettings({ ...settings, navCollapsed: !settings.navCollapsed });
  }, [saveSettings, settings]);

  // Use toggle state for all devices
  const isEffectivelyCollapsed = settings.navCollapsed;
  const collapsedWidth = isMobile ? 0 : NAV_WIDTH_COLLAPSED;
  const navWidth = isMobile
    ? isEffectivelyCollapsed
      ? 0
      : NAV_WIDTH_EXPANDED
    : isEffectivelyCollapsed
      ? collapsedWidth
      : NAV_WIDTH_EXPANDED;

  return (
    <>
      {/* Mobile: backdrop overlay with fade transition */}
      {isMobile && (
        <Backdrop
          open={!isEffectivelyCollapsed}
          onClick={handleBackdropClick}
          sx={{
            zIndex: 1200,
            top: 0,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
          }}
        />
      )}

      {shouldShowNav && (
        <VerticalNavContainer
          isRTL={isRTL}
          isTablet={isTablet}
          isMobile={isMobile}
          navCollapsed={isEffectivelyCollapsed}
          sx={{ width: navWidth }}
        >
          {/* Sidebar Header with Logo and Current Module */}
          <SidebarHeader>
            <AppLogo showSecondaryLogo={isEffectivelyCollapsed} />
          </SidebarHeader>

          {/* Nav Menu */}
          <Box className='nav-wrapper'>
            <Nav navCollapsed={isEffectivelyCollapsed} />
          </Box>
          {/* Toggle Button at Bottom */}
          <SidebarFooter>
            <SidebarToggle onClick={handleToggleClick}>
              <Icon
                icon={isEffectivelyCollapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'}
                fontSize={18}
              />
            </SidebarToggle>
          </SidebarFooter>
        </VerticalNavContainer>
      )}
    </>
  );
};

export default memo(AppLayout);

// Re-export Header for use in PrivateLayout
export { default as AppHeader } from './header';
