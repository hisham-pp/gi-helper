import {
  FilledTextFieldProps,
  OutlinedTextFieldProps,
  StandardTextFieldProps,
  TextFieldVariants,
} from '@mui/material';

type TextFieldProps<Variant extends TextFieldVariants> = Variant extends 'filled'
  ? FilledTextFieldProps
  : Variant extends 'standard'
    ? StandardTextFieldProps
    : Variant extends 'outlined'
      ? OutlinedTextFieldProps
      : never;

type AppTextFieldProps<T extends TextFieldVariants> = TextFieldProps<T> & {
  isRequired?: boolean;
  isEmail?: boolean;
  readOnly?: boolean;
};

export default AppTextFieldProps;
