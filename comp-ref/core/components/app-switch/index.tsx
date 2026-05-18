'use client';

import React from 'react';
import Switch from '@mui/material/Switch';
import Translations from '../translations';
import { StyledFormControlLabel } from './styled-components';
import { AppSwitchProps } from './types';

const AppSwitch: React.FC<AppSwitchProps> = ({ label, labelProps, ...rest }) => {
  const isLabelTranslated = typeof label === 'string';
  return (
    <StyledFormControlLabel
      labelPlacement='start'
      label={isLabelTranslated ? <Translations text={label} /> : label}
      {...labelProps}
      control={<Switch {...rest} />}
    />
  );
};

export default AppSwitch;
