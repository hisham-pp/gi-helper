import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { keyframes, styled } from '@mui/material/styles';

const l7 = keyframes`
  33%  {inset:-10px; transform: rotate(0deg);}
  66%  {inset:-10px; transform: rotate(90deg);}
  100% {inset:0; transform: rotate(90deg);}
`;

const Loader = styled('div')(({ theme }) => ({
  width: '40px',
  aspectRatio: 1,
  color: theme.palette.primary.main,
  position: 'relative',
  background: `
    conic-gradient(from 134deg at top, currentColor 92deg, #0000 0) top,
    conic-gradient(from -46deg at bottom, currentColor 92deg, #0000 0) bottom
  `,
  backgroundSize: '100% 50%',
  backgroundRepeat: 'no-repeat',
  '&:before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    '--g': 'currentColor 14.5px, #0000 0 calc(100% - 14.5px), currentColor 0',
    background: `
      linear-gradient(45deg, var(--g)),
      linear-gradient(-45deg, var(--g))
    `,
    animation: `${l7} 1.5s infinite cubic-bezier(0.3, 1, 0, 1)`,
  },
}));

type Props = {
  boxProps?: BoxProps;
};

const SquareLoader: React.FC<Props> = ({ boxProps }) => {
  return (
    <Box {...boxProps}>
      <Loader />
    </Box>
  );
};

export default SquareLoader;
