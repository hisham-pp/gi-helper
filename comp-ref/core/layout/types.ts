export type LmsPortalType = 'admin' | 'learner';

export type NavGroup = {
  id?: number;
  icon?: string;
  title: string;
  path?: string;
  description?: string;
  statsText?: string;
  permissionKey?: string;
  openInNewTab?: boolean;
  isExternal?: boolean;
  isLmsCase?: boolean;
  lmsPortalType?: LmsPortalType;
  children?: (NavGroup | NavLink)[];
};

export type NavLink = {
  id?: number;
  icon?: string;
  path?: string;
  title: string;
  description?: string;
  statsText?: string;
  disabled?: boolean;
  isExternal?: boolean;
  isLmsCase?: boolean;
  lmsPortalType?: LmsPortalType;
  openInNewTab?: boolean;
  permissionKey?: string;
};

export type NavItemType = (NavLink | NavGroup)[];
