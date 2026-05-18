import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const StatusChipCard = styled(Box)(({ theme }) => ({
  borderRadius: '4px',
  minWidth: '60px',
  height: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 1.5),

  whiteSpace: 'nowrap',
  maxWidth: '100%',
}));

export const StatusChipLabel = styled(Typography)({
  fontSize: '12px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
