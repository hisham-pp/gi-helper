import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

export const ProcessFlowCardContainer = styled(Stack)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  gap: theme.spacing(3),

  '& .header-wrapper': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    '& .info-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  },

  '& .heading': {
    fontSize: 16,
    marginRight: theme.spacing(2),
  },

  '& .initial-view-wrapper': {
    backgroundColor: colors.lightShades.lightGrayishBlue,
    width: '100%',
    padding: theme.spacing(3),
    borderRadius: 3,
  },

  '& .initial-view': {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: theme.spacing(3),
  },
}));
