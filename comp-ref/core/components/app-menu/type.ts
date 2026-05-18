import { LinkProps } from 'next/link';
import { ReactNode } from 'react';
import { IconProps } from '@iconify/react';
import { DividerProps } from '@mui/material/Divider';
import { IconButtonProps } from '@mui/material/IconButton';
import { MenuProps } from '@mui/material/Menu';
import { MenuItemProps as MuiMenuItemProps } from '@mui/material/MenuItem';

type OptionJsxType = {
  content: ReactNode | ((closeHandler: () => void) => ReactNode);
  closeOnClick?: boolean;
  divider?: never;
  dividerProps?: never;
  href?: never;
  icon?: never;
  text?: never;
  linkProps?: never;
  menuItemProps?: never;
};

type OptionDividerType = {
  divider: boolean;
  dividerProps?: DividerProps;
  href?: never;
  icon?: never;
  text?: never;
  linkProps?: never;
  menuItemProps?: never;
};

export type OptionMenuItemType = {
  text: ReactNode;
  icon?: ReactNode;
  linkProps?: Omit<LinkProps, 'href'>;
  href?: LinkProps['href'];
  menuItemProps?: MuiMenuItemProps;
  divider?: never;
  dividerProps?: never;
  permissionKeys?: string[];
};

export type OptionType = string | OptionDividerType | OptionMenuItemType | OptionJsxType;

type Base = {
  menuProps?: Omit<MenuProps, 'open'>;
  options: OptionType[];
  onClick?: (value: unknown) => void;
};

type CustomAppMenuIconProps = Base & {
  renderMenuIcon?: ReactNode;
  icon?: never;
  iconButtonProps?: never;
  iconProps?: never;
  sx?: MenuProps['sx'];
  isShowButton?: boolean;
  inProgress?: boolean;
};

type AppMenuIconProps = Base & {
  icon?: ReactNode;
  iconButtonProps?: IconButtonProps;
  iconProps?: Omit<IconProps, 'icon'>;
  renderMenuIcon?: never;
  sx?: MenuProps['sx'];
  isShowButton?: boolean;
  inProgress?: boolean;
};

type HandleClose = { handleClose: () => void };

export type AppMenuProps = AppMenuIconProps | CustomAppMenuIconProps;

export type MenuOptionProps = {
  options: OptionType[];
  onClick?: Base['onClick'];
  dropdownClose: () => void;
};

export type TextOnlyMenuProps = HandleClose & {
  text: string;
};

export type MenuItemProps = HandleClose & {
  option: OptionMenuItemType;
  permissionKeys?: string[];
  onClick?: Base['onClick'];
};
