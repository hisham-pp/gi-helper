import { ReactNode } from 'react';
import { TooltipProps } from '@mui/material/Tooltip';
import { TypographyProps } from '@mui/material/Typography';

export type NameWithHelperTextProps<T> = {
  items?: T[];
};

export type MaterialUITooltipProps = {
  title: React.ReactNode;
  children: React.ReactNode;
} & TooltipProps;

export type ClickableTooltip = {
  content: ReactNode;
};

export type AttachmentTooltipProps = TypographyProps & {
  text: string;
  limit: number;
  showTooltip?: boolean;
};
