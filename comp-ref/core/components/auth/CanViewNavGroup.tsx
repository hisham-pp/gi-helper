import { FC, ReactNode } from 'react';
import { NavGroup, NavLink } from '@/core/layout/types';
import { usePermission } from '@/hooks/use-permission';

type Props = {
  navGroup?: NavGroup | NavLink;
  children: ReactNode;
};

const CanViewNavGroup: FC<Props> = ({ navGroup, children }) => {
  const { havePermission } = usePermission();

  const checkForVisibleChild = (children: NavLink[] | NavGroup[]): boolean => {
    return children.some((child) => {
      if ((child as NavGroup)?.children) {
        return checkForVisibleChild((child as NavGroup).children || []);
      } else {
        return child?.permissionKey ? havePermission(child?.permissionKey) : true;
      }
    });
  };

  const canViewNavDropdown = (item: NavGroup) => {
    if (item?.permissionKey && havePermission(item?.permissionKey)) {
      return item?.children && checkForVisibleChild(item?.children);
    }
  };

  if (!(navGroup as NavGroup)?.permissionKey) {
    return children;
  }

  if (navGroup && canViewNavDropdown(navGroup)) {
    return children;
  }

  return null;
};

export default CanViewNavGroup;
