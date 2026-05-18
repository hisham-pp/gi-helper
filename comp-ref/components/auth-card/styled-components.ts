import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AuthPageWrapper = styled(Box)(({ theme }) => ({
  '& .auth-card': {
    minWidth: 400,
    maxWidth: 400,
    padding: theme.spacing(4),
    borderRadius: theme.spacing(4),
    boxShadow: theme.shadows[3],
    backgroundColor: '#fff',

    '& .mobile-logo': {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        marginBottom: theme.spacing(4),
        marginTop: 0,
      },
    },

    '& .icon-button': {
      padding: '5px',
      border: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(4),

      '& svg': {
        color: theme.palette.primary.main,
      },
    },

    '& .title': {
      fontWeight: theme.typography.fontWeightBold,
      fontSize: 20,
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        fontSize: 24,
        fontWeight: 600,
        marginBottom: theme.spacing(2),
      },
    },

    '& .sub-info': {
      fontSize: 13,
      marginTop: theme.spacing(1),
      color: theme.palette.text.secondary,
    },

    '& .MuiTextField-root': {
      '& .MuiInputBase-root': {
        [theme.breakpoints.down('sm')]: {
          height: 48,
          fontSize: 16,
        },
      },
      '& .MuiInputBase-root.MuiInputBase-sizeMedium': {
        height: 44,
      },
      '& .MuiInputLabel-root': {
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
    },

    [theme.breakpoints.down('sm')]: {
      minWidth: 'unset',
      maxWidth: '100%',
      width: '100%',
      padding: theme.spacing(4),
      borderRadius: theme.spacing(2),
      boxShadow: 'none',
      backgroundColor: theme.palette.background.paper,
    },
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: theme.palette.grey[50],
  },
}));
