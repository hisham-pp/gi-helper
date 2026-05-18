import React, { ReactNode } from 'react';
import { usePermission } from '@/hooks/use-permission';

type Props = {
  children?: ReactNode;
  permissionKeys?: string[];
};

const PermissionWrapper: React.FC<Props> = ({ children, permissionKeys }) => {
  const { havePermission } = usePermission();

  if (!permissionKeys || !permissionKeys?.length) {
    return <>{children}</>;
  }

  if (permissionKeys?.some((key) => havePermission(key))) {
    return <>{children}</>;
  }

  return null;
};

export default PermissionWrapper;
