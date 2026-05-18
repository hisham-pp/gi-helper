import { ReactNode } from 'react';
import { BoxProps } from '@mui/material/Box';
import { Control } from 'react-hook-form';
import { AppButtonProps } from '@/core/components/button/types';

type ExtendedBoxProps = BoxProps & { containerWidth?: number };

type ButtonProps = Omit<AppButtonProps, 'children' | 'onClick'>;

export type DeleteModalProps = {
  containerWidth?: number;
  containerProps?: ExtendedBoxProps;
  iconSize?: number;
  title?: string;
  confirmationText?: string;
  additionalConfirmationText?: string;
  outlineLabel?: string;
  containedLabel?: string;
  containedButtonProps?: ButtonProps;
  outlinedButtonProps?: ButtonProps;
  endContent?: ReactNode;
  onClose?: () => void;
  onDelete?: () => void;
  isShowCommentBox?: boolean;
  control?: Control<{ comment: string }>;
};
