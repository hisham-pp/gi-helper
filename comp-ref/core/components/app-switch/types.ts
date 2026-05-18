import { ReactNode } from 'react';
import { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { SwitchProps } from '@mui/material/Switch';

export type AppSwitchProps = SwitchProps & {
  label?: ReactNode;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
};
