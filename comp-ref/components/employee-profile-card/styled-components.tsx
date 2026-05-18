import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

export const Container = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  boxShadow: 'none',
  minHeight: 140,

  ['& .img-wrapper']: {
    height: 110,
    width: 110,
    flexShrink: 0,
  },

  ['& .details-wrapper']: {
    width: 'calc(100% - 120px)',
    height: '100%',
    padding: theme.spacing(1, 2),
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),

    ['& .text-wrapper']: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    ['& .rating-wrapper']: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
  },
}));

export const ProfileChipContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  border: `2px dashed ${theme.palette.divider}`,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  ['& .value']: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(16),
    minWidth: 100,
    marginTop: theme.spacing(0.5),
    width: 'max-content',
  },

  ['& .label']: {
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.secondary,
    width: 'max-content',
    fontSize: theme.typography.pxToRem(12),
  },
}));

export const IconContainer = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(1),
  display: 'flex',

  '& div': {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(0.75, 1.5),
    width: 50,
    color: theme.palette.primary.main,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,

    '& p': {
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightBold,
      fontSize: theme.typography.pxToRem(13),
    },
  },
}));
