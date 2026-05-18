import { BoxProps } from '@mui/material';
import { DatePickerProps } from 'react-datepicker';
import AppTextFieldProps from '../app-textfield/type';

type InputProps = Omit<AppTextFieldProps<'outlined'>, 'variant'> & {
  errorMessage?: string;
  showIcon?: boolean;
};

export type PickerProps = {
  inputProps?: InputProps;
  wrapperProps?: BoxProps;
};

export type AppDatePickerProps = DatePickerProps & PickerProps;
