'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SettingsContext } from '@/context/SettingsContext';
import CanViewNavItem from '@/core/components/auth/CanViewNavItem';
import Icon from '@/core/components/icon';
import Translations from '@/core/components/translations';
import useToast from '@/hooks/use-toast';
import { useMixpanelTracking } from '@/hooks/useMixpanelTracking';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { Any } from '@/types';
import { resolveLmsPortalUrl, resolveLMSReroutes } from '@/utils/lms-utils';
import { NavGroup, NavLink } from '../../types';
import { NavItemWrapper } from './styled-components';

type Props = {
  item?: NavLink | NavGroup;
  isParent?: boolean;
  isGroupItem?: boolean;
  isDropDownOpen?: boolean;
  navCollapsed?: boolean;
  siblingPaths?: string[];
  onClick?: (item?: NavLink) => void;
};

const NavItem: React.FC<Props> = ({
  item,
  isParent,
  isGroupItem,
  isDropDownOpen,
  navCollapsed,
  siblingPaths,
  onClick,
}) => {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const { palette } = useTheme();
  const { showErrorToast } = useToast();
  const { clearAllExpandedGroups } = useContext(SettingsContext);
  const { trackNavigationClick } = useMixpanelTracking();
  const company = useAppSelector((state) => state.company?.entity);

  const Wrapper = (item?.path || item?.isLmsCase) && !item?.isExternal ? Link : Box;

  const [lmsPath, setLmsPath] = useState(item?.path ?? '');

  const isNavActive = useMemo(() => {
    if (!item) return false;

    // For parent items, check if any child matches
    if ((item as NavGroup)?.children?.length) {
      return (item as NavGroup).children.some(
        (child) => child.path && (path === child.path || path.startsWith(child.path + '/')),
      );
    }

    if (!item.path) return false;

    const isMatch = path === item.path || path.startsWith(item.path + '/');
    if (!isMatch) return false;

    // If a sibling has a more specific (longer) match, this item should not be active
    if (siblingPaths?.length) {
      const hasBetterSibling = siblingPaths.some(
        (sp) => sp.length > item.path!.length && (path === sp || path.startsWith(sp + '/')),
      );
      if (hasBetterSibling) return false;
    }

    return true;
  }, [item, path, siblingPaths]);

  const getTokenFromUrl = (urlString: string): string | null | undefined => {
    try {
      return new URL(urlString).searchParams.get('token');
    } catch {
      return undefined;
    }
  };

  const isLmsTokenInvalid = useCallback((): boolean => {
    if (!lmsPath) return false;

    const token = getTokenFromUrl(lmsPath ?? '');
    const isInvalid = !token || token === 'null';

    if (isInvalid) {
      showErrorToast('Something went wrong, please contact your administrator');
    }

    return isInvalid;
  }, [lmsPath, showErrorToast]);

  const getHrefPath = useCallback((): string => {
    if (item?.isLmsCase) {
      return lmsPath || '/';
    }
    return item?.path || '/';
  }, [item, lmsPath]);

  useEffect(() => {
    if (item?.isLmsCase) {
      if (item.lmsPortalType) {
        // Use dynamic portal URL from company settings
        setLmsPath(resolveLmsPortalUrl(item.lmsPortalType, company));
      } else if (item.path) {
        // Fallback to static path if no portal type specified
        setLmsPath(resolveLMSReroutes(item.path));
      }
    }
  }, [item, company]);

  useEffect(() => {
    // Fetch company account if not loaded and this is an LMS item
    if (item?.isLmsCase && item?.lmsPortalType && !company?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [item, company?.id, dispatch]);

  const isCurrentPath = useMemo(() => {
    if (!item?.path) return false;
    const isMatch = path === item.path || path.startsWith(item.path + '/');
    if (!isMatch) return false;

    // If a sibling has a more specific (longer) match, this is not the current path
    if (siblingPaths?.length) {
      const hasBetterSibling = siblingPaths.some(
        (sp) => sp.length > item.path!.length && (path === sp || path.startsWith(sp + '/')),
      );
      if (hasBetterSibling) return false;
    }

    return true;
  }, [item?.path, path, siblingPaths]);

  const navItemContent = (
    <NavItemWrapper
      isGroupItem={isGroupItem}
      active={isNavActive}
      isGroupItemActive={isGroupItem && isCurrentPath}
      navCollapsed={navCollapsed}
      id={item?.id ? `nav-item-${item.id}` : undefined}
      data-active={isCurrentPath ? 'true' : undefined}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: navCollapsed ? 0 : 2,
          justifyContent: navCollapsed ? 'center' : 'flex-start',
          width: navCollapsed ? '100%' : 'auto',
        }}
      >
        {isGroupItem && !navCollapsed && (
          <Icon
            icon='bxs:circle'
            fontSize={8}
            style={{
              color: isNavActive ? palette.primary.main : palette.text.secondary,
              filter: `drop-shadow(0 0 1.5px ${isNavActive ? palette.primary.main : palette.text.secondary})`,
            }}
          />
        )}

        {item?.icon && !isGroupItem && <Icon icon={item.icon} fontSize={18} />}
        {!navCollapsed && (
          <Typography variant='body2' className='link-text'>
            <Translations text={item?.title} />
          </Typography>
        )}
      </Box>
      {isParent && !navCollapsed && (
        <Icon
          icon='iconamoon:arrow-right-2-thin'
          className={isDropDownOpen ? 'drop-down-open' : ''}
        />
      )}
    </NavItemWrapper>
  );

  const shouldShowTooltip = navCollapsed && !isGroupItem;

  return (
    <CanViewNavItem navItem={item}>
      <Box
        component={Wrapper}
        href={getHrefPath()}
        {...(item?.openInNewTab ? { target: '_blank' } : null)}
        onClick={(e: Any) => {
          onClick && onClick(item);
          if (!isParent && !isGroupItem) {
            clearAllExpandedGroups();
          }
          // Handle external links
          if (item?.isExternal && item?.path) {
            e.preventDefault();
            window.open(item.path, '_blank', 'noopener,noreferrer');
          }
          if (item?.isLmsCase && isLmsTokenInvalid()) {
            e.preventDefault();
            e.stopPropagation();
          }
          // Track navigation click
          if (item?.path && !isParent) {
            trackNavigationClick(item.path, {
              menuItem: item.title,
              isGroupItem,
              openInNewTab: item.openInNewTab,
              isExternal: item.isExternal,
            });
          }
        }}
        sx={{ width: '100%' }}
      >
        {shouldShowTooltip ? (
          <Tooltip title={<Translations text={item?.title} />} placement='right' arrow>
            {navItemContent}
          </Tooltip>
        ) : (
          navItemContent
        )}
      </Box>
    </CanViewNavItem>
  );
};

export default memo(NavItem);
