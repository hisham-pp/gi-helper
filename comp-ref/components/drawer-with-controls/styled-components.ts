'use client';

import { Box, BoxProps, Drawer, DrawerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

type ColorBoxProps = BoxProps & {
  bgcolor?: string;
};

type StyledDrawerProps = DrawerProps & {
  anchor?: 'left' | 'right' | 'top' | 'bottom';
};

export const StyledDrawer = styled(Drawer)<StyledDrawerProps>(({ theme, anchor }) => ({
  '& .MuiDrawer-paper': {
    ...(anchor === 'left' && {
      borderRadius: 0,
      borderTopRightRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius,
    }),
    ...(anchor === 'right' && {
      borderRadius: 0,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderBottomLeftRadius: theme.shape.borderRadius,
    }),
    ...(anchor === 'top' && {
      borderRadius: 0,
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius,
    }),
    ...(anchor === 'bottom' && {
      borderRadius: 0,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius,
    }),
    [theme.breakpoints.down('sm')]: {
      borderRadius: 0,
    },
  },
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),

  '& .header': {
    fontSize: 15,
    fontWeight: theme.typography.fontWeightBold,
  },

  '& .sub-header': {
    fontSize: 14,
    color: theme.palette.text.secondary,
  },

  '& .close': {
    '& svg': {
      fontSize: 14,
    },
  },
}));

export const DrawerFooter = styled(Box)<BoxProps>(({ theme }) => ({
  position: 'sticky',
  bottom: 8,
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3, 0, 3),
  zIndex: 300,
  backgroundColor: theme.palette.common.white,
}));

export const Content = styled(Box)<BoxProps>(({ theme }) => ({
  overflow: 'auto',
  flexGrow: 1,
  padding: theme.spacing(2, 3),
  willChange: 'scroll-position',
}));

export const ColorBox = styled(Box)<ColorBoxProps>(({ theme, bgcolor }) => ({
  width: '16px',
  height: '16px',
  backgroundColor: bgcolor || theme.palette.grey[300],
  borderRadius: '4px',
  marginRight: theme.spacing(1),
}));
