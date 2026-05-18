import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography, { TypographyProps } from '@mui/material/Typography';

export const SimplePaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3), // Balanced vertical padding for centered alignment
  boxShadow: theme.shadows[6],

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
  },
}));

export const Title = styled(Typography, {
  shouldForwardProp: (prop) => !['fontSize', 'fontWeight'].includes(prop as string),
})<TypographyProps & { fontSize?: number; fontWeight?: string }>(
  ({ theme, fontSize, fontWeight }) => ({
    display: 'flex',
    alignItems: 'center',
    fontWeight: `${fontWeight}`,
    fontSize: `${fontSize}px`,
    color: theme.palette.text.primary,
    minHeight: 35,

    ['& button']: {
      padding: theme.spacing(1.5),
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(-1),
      borderRadius: 0,
    },

    ['& svg']: { fontSize: '18px !important', color: theme.palette.text.primary },

    [theme.breakpoints.down('sm')]: {
      ['& svg']: { fontSize: '16px !important', color: theme.palette.text.primary },
    },
  }),
);

export const Container = styled(Card)(({ theme }) => ({
  overflow: 'unset',
  borderRadius: theme.shape.borderRadius,

  '& .wrapper': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2, 3),
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5, 2),
    },

    '& .search-container': {
      minWidth: 200,
      maxWidth: 340,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),

      [theme.breakpoints.down('sm')]: {
        minWidth: 'unset',
        maxWidth: 'unset',
        width: '100%',
      },
    },
  },
}));
