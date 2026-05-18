'use client';

import React, { FC, memo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import colors from '@/utils/colors';
import hexToRGBA from '@/utils/hex-to-rgba';
import { getOrDefault } from '@/utils/string-utils';
import { ProfileChipContainer } from './styled-components';
import { ProfileChipOptions as ProfileChipProps } from './types';

const { lightMist, softPink, mintTint, lightYellow } = colors.lightShades;

const ProfileChip: FC<ProfileChipProps> = (props) => {
  const { variant = 'primary' } = props;

  const getBackgroundColor = useCallback(() => {
    switch (variant) {
      case 'quaternary':
        return hexToRGBA(lightYellow, 0.8);
      case 'tertiary':
        return lightMist;
      case 'secondary':
        return softPink;
      case 'primary':
      default:
        return mintTint;
    }
  }, [variant]);

  if ('label' in props) {
    return (
      <ProfileChipContainer
        elevation={0}
        sx={{
          backgroundColor: getBackgroundColor(),
        }}
      >
        <Box>
          <Typography variant='h4' className='value'>
            {getOrDefault(props.value, '-')}
          </Typography>
          <Typography variant='body2' className='label'>
            {props.label}
          </Typography>
        </Box>
      </ProfileChipContainer>
    );
  }

  return (
    <ProfileChipContainer
      elevation={0}
      sx={{
        backgroundColor: getBackgroundColor(),
      }}
    >
      {props.component}
    </ProfileChipContainer>
  );
};

export default memo(ProfileChip);
