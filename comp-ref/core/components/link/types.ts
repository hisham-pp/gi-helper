import { HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { SxProps } from '@mui/material/styles';

export type Props = {
  to?: string;
  children: ReactNode;
  sx?: SxProps;
  target?: HTMLAttributeAnchorTarget;
};
