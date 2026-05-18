import { ElementType } from 'react';
import { BoxProps } from '@mui/material/Box';
import { PaperProps } from '@mui/material/Paper';
import { AppButtonProps } from '@/core/components/button/types';

export type DrawerWithControlsProps = {
  open: boolean;
  children: React.JSX.Element;
  title?: string | React.ReactNode;
  subHeader?: string;
  component?: ElementType;
  showFooter?: boolean;
  loading?: boolean;
  outlineButtonProps?: AppButtonProps & { label?: string; isShow?: boolean };
  filledButtonProps?: AppButtonProps & { label?: string; isShow?: boolean };
  footerContainerProps?: BoxProps;
  paperProps?: PaperProps;
  contentProps?: BoxProps;
  transitionDuration?: number | { enter?: number; exit?: number };
  onClose: () => void;
  onSave?: (e: React.FormEvent<HTMLDivElement>) => void;
};
