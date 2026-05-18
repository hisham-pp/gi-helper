import { ReactNode } from 'react';
import { RadioGroupProps } from '@mui/material';
import { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { RadioProps } from '@mui/material/Radio';

export type RadioType = {
  value: string;
  label: ReactNode;
  infoContent?: string;
};

export type AppRadioProps = {
  value?: string;
  row?: boolean;
  radioList?: RadioType[];
  formLabelProps?: Omit<FormControlLabelProps, 'value' | 'label' | 'control'>;
  radioProps?: RadioProps;
  radioGroupProps?: RadioGroupProps;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  id?: string;
};
