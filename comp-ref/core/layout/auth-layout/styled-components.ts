import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const AuthWrapper = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',

  '& .container': {
    display: 'flex',
    height: '100%',

    '& .illustrator': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      gap: theme.spacing(6),

      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },

    '& .tagline': {
      fontWeight: 800,
      fontSize: '1.25rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#1c1c1e',
    },

    '& .main': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1C1C1D',
      position: 'relative',
      gap: theme.spacing(10),
      padding: theme.spacing(4),

      [theme.breakpoints.down('sm')]: {
        backgroundColor: 'white',
      },
    },

    '& .logo-container': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',

      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },

    '& .star-decoration': {
      marginTop: theme.spacing(16),

      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  },

  '& .auth-loader': {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  '& .auth-brand': {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 400,
    height: 50,

    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '90%',
      padding: theme.spacing(4),
    },
  },
}));
