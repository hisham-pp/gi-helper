import React from 'react';
import AppTextfield from '@/core/components/app-textfield';
import { NumberFormatCustom } from './Components';
import { TimeInputFieldProps } from './type';

const TimeInputField: React.FC<TimeInputFieldProps> = ({ slotProps, ...props }) => {
  return (
    <AppTextfield
      slotProps={{ input: { inputComponent: NumberFormatCustom, ...slotProps?.input } }}
      {...props}
    />
  );
};

export default TimeInputField;
