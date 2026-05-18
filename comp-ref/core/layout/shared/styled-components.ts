import Link from 'next/link';
import { BoxProps, styled } from '@mui/material';

type LogoWrapperProps = BoxProps & { showSecondaryLogo: boolean };

export const LogoWrapper = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'showSecondaryLogo',
})<LogoWrapperProps>(({ showSecondaryLogo }) => ({
  position: 'relative',
  width: showSecondaryLogo ? 40 : 160,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: showSecondaryLogo ? 'center' : 'flex-start',
  overflow: 'hidden',
  flexShrink: 0,
  transition: 'width 0.3s ease-in-out',

  ['& .expanded-logo']: {
    opacity: showSecondaryLogo ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    display: showSecondaryLogo ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ['& .collapsed-logo']: {
    opacity: showSecondaryLogo ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    display: showSecondaryLogo ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
