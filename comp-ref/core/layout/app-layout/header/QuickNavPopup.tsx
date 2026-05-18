'use client';

import { useRouter } from 'next/navigation';
import { memo, useCallback, useContext, useMemo } from 'react';
import { useTheme } from '@mui/material';
import Popover from '@mui/material/Popover';
import { useTranslation } from 'react-i18next';
import navItems from '@/constant/nav-items';
import { SettingsContext } from '@/context/SettingsContext';
import Icon from '@/core/components/icon';
import type { NavGroup } from '@/core/layout/types';
import { usePermission } from '@/hooks/use-permission';
import {
  PopupContainer,
  PopupGrid,
  PopupHeader,
  PopupHeaderTitle,
  PopupIconWrapper,
  PopupItem,
  PopupItemTitle,
} from './QuickNavPopup.styled';

type QuickNavPopupProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
};

const QuickNavPopup = ({ anchorEl, open, onClose }: QuickNavPopupProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedNavId, setSelectedNavId } = useContext(SettingsContext);
  const { havePermission } = usePermission();
  const theme = useTheme();

  // Filter nav items based on permissions
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!item.permissionKey) return true;
      return havePermission(item.permissionKey);
    });
  }, [havePermission]);

  const handleItemClick = useCallback(
    (item: NavGroup) => {
      // Set the selected nav item (this also expands it)
      if (item.id) {
        setSelectedNavId(item.id);
      }

      // Navigate to the first accessible child path or the item's path
      let targetPath = item.path;

      if (!targetPath && item.children?.length) {
        // Find the first child with a path that the user has permission to access
        const firstAccessibleChild = item.children.find((child) => {
          if (!child.path) return false;
          if (!child.permissionKey) return true; // No permission required
          return havePermission(child.permissionKey);
        });
        targetPath = firstAccessibleChild?.path;
      }

      if (targetPath) {
        // Handle external links
        if ((item as any).isExternal || targetPath.startsWith('http')) {
          window.open(targetPath, '_blank', 'noopener,noreferrer');
        } else {
          router.push(targetPath);
        }
      }

      onClose();
    },
    [router, setSelectedNavId, onClose, havePermission],
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            borderRadius: 1,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <PopupContainer>
        <PopupHeader>
          <PopupHeaderTitle>{t('quickNav.switchModule')}</PopupHeaderTitle>
        </PopupHeader>
        <PopupGrid>
          {filteredNavItems.map((item) => {
            const isActive = selectedNavId === item.id;
            return (
              <PopupItem
                key={item.id}
                isActive={isActive}
                onClick={() => handleItemClick(item as NavGroup)}
              >
                <PopupIconWrapper>
                  <Icon icon={item.icon || 'material-symbols:folder'} width={20} height={20} />
                </PopupIconWrapper>
                <PopupItemTitle isActive={isActive}>{t(item.title)}</PopupItemTitle>
              </PopupItem>
            );
          })}
        </PopupGrid>
      </PopupContainer>
    </Popover>
  );
};

export default memo(QuickNavPopup);
