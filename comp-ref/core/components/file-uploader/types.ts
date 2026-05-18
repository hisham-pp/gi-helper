import { SxProps } from '@mui/material';
import { Any } from '@/types';

export type FileUploaderProps = {
  accept?: { [key: string]: string[] };
  inputProps: {
    id?: string;
    variant?: string;
    label?: string | React.JSX.Element;
    value?: string | string[] | File | File[] | null | Any;
    markAsRequired?: boolean;
    error?: boolean;
    helperText?: string;
    sx?: SxProps;
  };
  onUpload: (files: File[] | null | File) => void;
  isMultiple?: boolean;
  aspectRatio?: number;
  isCrop?: boolean;
  isDisabled?: boolean;
  preview?: boolean;
  id?: string;
  isViewMode?: boolean;
};
