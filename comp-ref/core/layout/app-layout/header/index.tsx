import { usePathname } from 'next/navigation';
import { memo, useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import permissionKeys from '@/constant/permission-keys';
import { ROUTES } from '@/constant/routes';
import Icon from '@/core/components/icon';
import { usePermission } from '@/hooks/use-permission';
import useResponsive from '@/hooks/use-responsive';
import { useSettings } from '@/hooks/use-settings';
import CompanyFilter from './CompanyFilter';
import DivisionBranchSwitcher from './DivisionBranchSwitcher';
import Locale from './Locale';
import UserNotification from './notification';
import QuickNavPopup from './QuickNavPopup';
import QuickSearch from './QuickSearch';
import { HeaderWrapper } from './styled-components';
import UserDropdown from './UserDropdown';

const {
  master: { company },
} = ROUTES;

const Header = () => {
  const pathname = usePathname();
  const { isSuperAdmin, havePermission } = usePermission();
  const { isMobile } = useResponsive();
  const { settings, saveSettings } = useSettings();

  const handleMenuToggle = useCallback(() => {
    saveSettings({ ...settings, navCollapsed: !settings.navCollapsed });
  }, [saveSettings, settings]);

  const [quickNavAnchor, setQuickNavAnchor] = useState<HTMLElement | null>(null);
  const isQuickNavOpen = Boolean(quickNavAnchor);

  const handleQuickNavOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setQuickNavAnchor(event.currentTarget);
  }, []);

  const handleQuickNavClose = useCallback(() => {
    setQuickNavAnchor(null);
  }, []);

  const isPermissionToHaveMultiLanguage = useMemo(
    () => havePermission(permissionKeys.general.multiLanguage.view),
    [havePermission],
  );

  const showCompanyFilter = useMemo(
    () => isSuperAdmin && !pathname.includes(company.root.path),
    [isSuperAdmin, pathname],
  );

  return (
    <HeaderWrapper>
      {isMobile && (
        <IconButton onClick={handleMenuToggle} sx={{ mr: 'auto' }}>
          <Icon icon='mdi:menu' />
        </IconButton>
      )}
      <Box className='title-end'>
        <QuickSearch />
        {!isMobile && <UserNotification />}
        {!isMobile && <DivisionBranchSwitcher />}
        {showCompanyFilter && !isMobile && <CompanyFilter />}
        <Tooltip title='Quick Navigation'>
          <IconButton onClick={handleQuickNavOpen}>
            <Icon icon='material-symbols:apps' />
          </IconButton>
        </Tooltip>
        <QuickNavPopup
          anchorEl={quickNavAnchor}
          open={isQuickNavOpen}
          onClose={handleQuickNavClose}
        />
        {isPermissionToHaveMultiLanguage && !isMobile && <Locale />}
        <UserDropdown />
      </Box>
    </HeaderWrapper>
  );
};

export default memo(Header);
