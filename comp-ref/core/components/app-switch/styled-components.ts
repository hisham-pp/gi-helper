import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';

export const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  width: '100%',

  '& .MuiFormControlLabel-label': {
    fontSize: 12,
    fontWeight: theme.typography.fontWeightMedium,
  },

  '& .MuiSwitch-root': {
    transform: 'scale(0.7)',
    marginRight: theme.spacing(-1),
  },
}));
