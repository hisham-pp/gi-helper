'use client';

import React from 'react';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ProgressBarProps } from './types';

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  return (
    <Stack spacing={1}>
      <Typography
        variant='body2'
        color='textSecondary'
        sx={{ fontSize: '12px' }}
      >{`${value}%`}</Typography>
      <LinearProgress
        variant='determinate'
        value={value}
        sx={{
          width: '100%',
          height: 5,
          borderRadius: 5,
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
          },
        }}
      />
    </Stack>
  );
};

export default ProgressBar;
