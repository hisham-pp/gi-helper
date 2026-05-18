import { FC, ReactNode } from 'react';
import { NavGroup, NavLink } from '@/core/layout/types';
import { usePermission } from '@/hooks/use-permission';

type Props = {
  navItem?: NavLink | NavGroup;
  children: ReactNode;
};

const CanViewNavItem: FC<Props> = ({ navItem, children }) => {
  const { havePermission } = usePermission();

  if (!navItem?.permissionKey) {
    return children;
  }

  if (havePermission(navItem?.permissionKey)) {
    return children;
  }

  return null;
};

export default CanViewNavItem;
