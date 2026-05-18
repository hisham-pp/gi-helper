import React from 'react';
import Stack from '@mui/material/Stack';
import { AppFormSectionProps } from './types';

export default function FormHelperSection({ children, spacing = 6, ...rest }: AppFormSectionProps) {
  return (
    <Stack spacing={spacing} {...rest}>
      {children}
    </Stack>
  );
}
