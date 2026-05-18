import { ReactNode } from 'react';
import { CheckboxProps } from '@mui/material/Checkbox';
import { FormControlLabelProps } from '@mui/material/FormControlLabel';

export type AppCheckboxProps = CheckboxProps;

export type FormCheckboxProps = AppCheckboxProps & {
  label?: ReactNode;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
  disabled?: boolean;
  id?: string;
};
