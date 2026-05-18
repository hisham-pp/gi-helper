import { ReactNode } from 'react';
import { BoxProps } from '@mui/material/Box';
import { CardProps } from '@mui/material/Card';
import { PaperProps } from '@mui/material/Paper';
import { MenuOptionProps } from '@/core/components/app-menu/type';
import { AppButtonProps } from '@/core/components/button/types';
import { PaginationProps } from '@/core/components/pagination/types';
import { Any } from '@/types';

type ButtonProps = Omit<AppButtonProps, 'children'> & {
  label?: ReactNode;
  isShow?: boolean;
  permissionKeys?: string[];
};

export type SimpleHeaderProps = {
  title: ReactNode;
  titleSize?: 'small' | 'medium' | 'large';
  titleWeight?: 'light' | 'medium' | 'bold';
  renderTitleEnd?: ReactNode;
  paperProps?: PaperProps;
  showBackArrow?: boolean;
  variant?: 'standard' | 'shadowed';
  onBackClick?: () => void;
};

export type exportMenuProps = {
  inProgress?: boolean;
  options?: MenuOptionProps['options'];
  permissionKeys?: string[];
};

export type HeaderWithButtonsProps = SimpleHeaderProps & {
  outlineButtonProps?: ButtonProps;
  containedButtonProps?: ButtonProps;
  extendTitleEnd?: () => React.JSX.Element | null;
  renderActionsEnd?: () => React.JSX.Element | null;
  showExportMenu?: boolean;
  exportMenuProps?: exportMenuProps;
};

export type HeaderWithPaginationProps = {
  title: ReactNode;
  page?: number;
  totalCount?: number;
  entities?: Any[];
  variant?: SimpleHeaderProps['variant'];
  cardProps?: CardProps;
  searchContainerProps?: BoxProps;
  containedButtonLabel?: string;
  showContainedButton?: boolean;
  showSearch?: boolean;
  showExportMenu?: boolean;
  exportMenuProps?: exportMenuProps;
  showOutlineButton?: boolean;
  outlineButtonLabel?: string;
  titleSize?: SimpleHeaderProps['titleSize'];
  onCreate?: () => void;
  onClickOutlinedButton?: () => void;
  onSearchChange?: (value: string) => void;
  onPageChange?: PaginationProps['onChange'];
  extendTitleEnd?: () => React.JSX.Element;
  extendSearchEnd?: () => React.JSX.Element;
  extendSearchBottom?: () => React.JSX.Element;
  containedButtonPermissionKeys?: string[];
  showCount?: boolean;
};
