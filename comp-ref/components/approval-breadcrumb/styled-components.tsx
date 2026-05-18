import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

export const BreadCrumbContainer = styled(Grid)(({ theme }) => ({
  backgroundColor: colors.lightShades.lightGrayishBlue,
  padding: theme.spacing(3),
  borderRadius: 3,
  gap: theme.spacing(3),

  '& .approver-label': {
    color: theme.palette.text.primary,
    fontSize: 14,
    fontWeight: 500,
  },

  '& .sla-label': {
    color: theme.palette.primary.main,
    fontSize: 14,
    marginLeft: theme.spacing(1),
  },

  '& .arrow-icon': {
    margin: theme.spacing(0, 1),
  },

  '& .approve, .reject': {
    fontSize: 14,
  },

  '& .approve': {
    color: theme.palette.success.dark,
  },

  '& .reject': {
    color: theme.palette.error.dark,
  },
}));
