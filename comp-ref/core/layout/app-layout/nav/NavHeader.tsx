import React, { memo, useCallback, useMemo } from 'react';
import Icon from '@/core/components/icon';
import { useSettings } from '@/hooks/use-settings';
import AppLogo from '../../shared/AppLogo';
import { NavCollapseButton } from './styled-components';

const NavHeader = ({
  isNavHover = false,
  isTablet = false,
  isToggleButton = false,
  onlyLogo = false,
}: {
  isNavHover?: boolean;
  isTablet?: boolean;
  isToggleButton?: boolean;
  onlyLogo?: boolean;
}) => {
  const { settings, saveSettings } = useSettings();

  const isCollapsedAndNotHovered = useMemo(
    () => settings.navCollapsed && !isNavHover,
    [settings.navCollapsed, isNavHover],
  );

  const handleToggleCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      saveSettings({ ...settings, navCollapsed: !settings.navCollapsed });
    },
    [saveSettings, settings],
  );

  // Render toggle button as arrow on border
  if (isToggleButton) {
    return (
      <NavCollapseButton
        onClick={handleToggleCollapse}
        isCollapsedAndNotHovered={isCollapsedAndNotHovered}
        isTablet={isTablet}
        isCollapsed={settings.navCollapsed}
        aria-label='Toggle navigation'
      >
        <Icon
          icon={isCollapsedAndNotHovered ? 'line-md:menu-fold-right' : 'line-md:menu-fold-left'}
        />
      </NavCollapseButton>
    );
  }

  // Render only logo
  if (onlyLogo) {
    return <AppLogo showSecondaryLogo={isCollapsedAndNotHovered} />;
  }

  return null;
};

export default memo(NavHeader);
