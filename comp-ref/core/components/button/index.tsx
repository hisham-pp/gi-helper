import React from 'react';
import Button from '@mui/material/Button';
import DotLoader from '../loaders/Dot';
import { AppButtonProps } from './types';

const AppButton: React.FC<AppButtonProps> = ({
  variant = 'contained',
  fullWidth = false,
  size = 'small',
  children,
  loading = false,
  loaderColor,
  disabled,
  sx,
  id,
  ...rest
}) => {
  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      id={id}
      disabled={disabled || loading}
      sx={{ minHeight: 32, ...sx }}
      {...rest}
    >
      {loading ? <DotLoader color={loaderColor} /> : children}
    </Button>
  );
};

export default AppButton;
