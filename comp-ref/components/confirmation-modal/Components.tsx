import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const Container = styled(Box)(({ theme }) => ({
  minWidth: 300,
  minHeight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '& .title-wrapper': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    margin: theme.spacing(2),

    '& .title': {
      fontSize: 18,
      fontWeight: theme.typography.fontWeightBold,
    },

    '& button': {
      ':hover': {
        color: theme.palette.error.light,
      },
    },
  },

  '& .content-wrapper': {
    padding: theme.spacing(2, 4, 3, 4),
  },

  '& .button-wrapper': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
  },
}));
