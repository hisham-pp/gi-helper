'use client';

import { Box, SxProps, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoaderProps {
  sx?: SxProps<Theme>;
  color?: string;
}

const Loader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dotColor',
})<{ dotColor?: string }>(({ theme, dotColor }) => ({
  '--c': `${dotColor || theme.palette.primary.main} 90%, #ffffff00`,

  width: '50px',
  aspectRatio: '4',
  background: `
    radial-gradient(circle closest-side at left 6px top 50%, var(--c)),
    radial-gradient(circle closest-side, var(--c)),
    radial-gradient(circle closest-side at right 6px top 50%, var(--c))
  `,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  animation: 'l4 1s infinite alternate',

  '@keyframes l4': {
    to: {
      width: '20px',
      aspectRatio: '1',
    },
  },
}));

const DotLoader = ({ sx, color }: LoaderProps) => {
  return <Loader sx={sx} dotColor={color} />;
};

export default DotLoader;
