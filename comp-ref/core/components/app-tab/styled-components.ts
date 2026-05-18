'use client';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import hexToRGBA from '@/utils/hex-to-rgba';

export const HorizontalWrapper = styled(Box)(({ theme }) => ({
  '& .MuiTab-root': {
    textTransform: 'none',
    letterSpacing: 0.4,
    color: theme.palette.common.black,
    textAlign: 'start',
    fontSize: '0.8125rem',
    padding: theme.spacing(1, 2),
    minHeight: 36,
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.8125rem',
      padding: theme.spacing(1, 1.5),
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.75rem',
      padding: theme.spacing(0.75, 1),
      minHeight: 32,
    },
  },

  '& .MuiTabs-indicator': {
    left: 0,
    width: '3px',
    backgroundColor: theme.palette.primary.main,
  },

  '&.vertical': {
    flexGrow: 1,
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme?.palette?.common?.white,

    '& .MuiTabs-root': {
      minWidth: 200,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderBottomLeftRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('lg')]: {
        minWidth: 140,
      },
      [theme.breakpoints.down('md')]: {
        minWidth: 120,
      },
    },

    '& .MuiTab-root': {
      alignItems: 'flex-start',
      transition: 'background-color 200ms',
      minHeight: 40,
      paddingLeft: theme.spacing(3),

      '&.Mui-selected': {
        color: theme.palette.primary.main,
        backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
      },
    },

    '& .MuiTab-root:first-of-type': {
      paddingTop: theme.spacing(2),
    },
  },

  '& .vertical-tabs': {
    borderRight: `1px solid ${theme.palette.grey[300]}`,
  },

  '& .vertical-panels': {
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
    padding: theme.spacing(3),
    [theme.breakpoints.down('lg')]: {
      padding: theme.spacing(2.5),
    },
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },

  '&.horizontal': {
    '& .MuiTabs-root': {
      boxShadow: theme.shadows[6],
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.common.white,
      minHeight: 40,
    },

    '& .MuiTab-root': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      minHeight: 40,
    },

    '& .MuiTabs-indicator': {
      left: 'auto',
      bottom: 0,
      height: 3,
      width: 'auto',
    },
  },

  '&.horizontal.outlined': {
    '& .MuiTabs-root': {
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
    },
  },

  '& .horizontal-panels': {
    marginTop: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.common.white,
  },
}));
