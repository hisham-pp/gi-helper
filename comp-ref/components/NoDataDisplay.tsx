import Image from 'next/image';
import React, { FC, memo } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { EMPTY_BLUE_BOX } from '@/configs/image-paths';

type Props = {
  label?: string;
  img?: string;
};

const ImageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing(2),

  '& .label': {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
  },
}));

const NoDataDisplay: FC<Props> = ({ label = 'No data', img = EMPTY_BLUE_BOX }) => {
  return (
    <ImageContainer>
      <Image alt='blue-empty-box' src={img} width={200} height={200} />
      <Typography className='label'>{label}</Typography>
    </ImageContainer>
  );
};

export default memo(NoDataDisplay);
