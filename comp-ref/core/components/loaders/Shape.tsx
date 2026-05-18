import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const Loader = styled('div')(({ theme }) => ({
  width: '40px',
  aspectRatio: '1',
  '--c': `linear-gradient(${theme.palette.primary.main} 0 0)`,
  '--m': `radial-gradient(farthest-side, ${theme.palette.primary.main} 92%, #0000)`,
  background: `
    var(--c), var(--m),
    var(--c), var(--m), 
    var(--c), var(--m)
  `,
  backgroundSize: '8px 15px, 8px 8px',
  backgroundRepeat: 'no-repeat',
  animation: 'l15 2s infinite',

  '@keyframes l15': {
    '0%': {
      backgroundPosition: `
        0 0, 0 100%,
        50% 0, 50% 100%,
        100% 0, 100% 100%
      `,
    },
    '11.11%': {
      backgroundPosition: `
        0 calc(100% - 8px), 0 100%,
        50% 0, 50% 100%,
        100% 0, 100% 100%
      `,
    },
    '22.22%': {
      backgroundPosition: `
        0 calc(100% - 8px), 0 100%,
        50% calc(100% - 8px), 50% 100%,
        100% 0, 100% 100%
      `,
    },
    '33.33%': {
      backgroundPosition: `
        0 calc(100% - 8px), 0 100%,
        50% calc(100% - 8px), 50% 100%,
        100% calc(100% - 8px), 100% 100%
      `,
    },
    '44.44%': {
      backgroundPosition: `
        0 0, 0 15px,
        50% calc(100% - 8px), 50% 100%,
        100% calc(100% - 8px), 100% 100%
      `,
    },
    '55.55%': {
      backgroundPosition: `
        0 0, 0 15px,
        50% 0, 50% 15px,
        100% calc(100% - 8px), 100% 100%
      `,
    },
    '66.66%': {
      backgroundPosition: `
        0 0, 0 15px,
        50% 0, 50% 15px,
        100% 0, 100% 15px
      `,
    },
    '77.77%': {
      backgroundPosition: `
        0 0, 0 100%,
        50% 0, 50% 15px,
        100% 0, 100% 15px
      `,
    },
    '88.88%': {
      backgroundPosition: `
        0 0, 0 100%,
        50% 0, 50% 100%,
        100% 0, 100% 15px
      `,
    },
    '100%': {
      backgroundPosition: `
        0 0, 0 100%,
        50% 0, 50% 100%,
        100% 0, 100% 100%
      `,
    },
  },
}));

type Props = {
  boxProps?: BoxProps;
};

const ShapeLoader: React.FC<Props> = ({ boxProps }) => {
  return (
    <Box display='inline-block' alignItems='center' {...boxProps}>
      <Loader />
    </Box>
  );
};

export default ShapeLoader;
