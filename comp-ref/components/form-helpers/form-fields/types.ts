import { GridSize, TextFieldVariants } from '@mui/material';
import AppTextFieldProps from '@/core/components/app-textfield/type';
import { FileUploaderProps } from '@/core/components/file-uploader/types';

type AdditionalProps = {
  xs?: GridSize;
  gutterTop?: number;
  markAsRequired?: boolean;
  outerLabel?: string;
};
export type FormFileUploadProps = AdditionalProps & FileUploaderProps;
export type FormTextFieldProps<Variant extends TextFieldVariants> = AdditionalProps &
  AppTextFieldProps<Variant>;
