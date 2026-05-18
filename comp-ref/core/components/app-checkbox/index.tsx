'use client';

import Checkbox from '@mui/material/Checkbox';
import { AppCheckboxProps } from './types';

const AppCheckbox: React.FC<AppCheckboxProps> = ({ id, size = 'small', sx, ...rest }) => {
  return <Checkbox size={size} sx={{ p: 0.5, ...sx }} {...rest} id={id} />;
};

export default AppCheckbox;
