'use client';

import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Control, Controller } from 'react-hook-form';
import AppTextfield from '@/core/components/app-textfield';
import Icon from '@/core/components/icon';
import { Any } from '@/types';

type Props = {
  name: string;
  label?: string;
  placeholder: string;
  control: Control<Any>;
  style?: React.CSSProperties;
  size?: 'small' | 'medium';
};

const PasswordField: React.FC<Props> = ({ control, name, label, placeholder, style, size }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <AppTextfield
          type={!showPassword ? 'password' : 'text'}
          label={label}
          placeholder={placeholder}
          size={size}
          error={Boolean(error?.message)}
          helperText={error?.message}
          slotProps={{
            input: {
              style: { ...style },
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={toggleShowPassword}>
                    <Icon
                      fontSize={18}
                      icon={!showPassword ? 'iconamoon:eye-off-bold' : 'fa-regular:eye'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...field}
        />
      )}
    />
  );
};

export default PasswordField;
