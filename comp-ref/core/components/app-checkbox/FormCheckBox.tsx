'use client';

import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Translations from '../translations';
import { FormCheckboxProps } from './types';
import AppCheckbox from '.';

const FormCheckBox: React.FC<FormCheckboxProps> = ({ label, labelProps, disabled, ...rest }) => {
  return (
    <FormControlLabel
      control={<AppCheckbox {...rest} />}
      label={typeof label === 'string' ? <Translations text={label} /> : label}
      disabled={disabled}
      sx={{ ml: 0, mr: 0 }}
      {...labelProps}
    />
  );
};

export default FormCheckBox;
