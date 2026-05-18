import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const TooltipTypography = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.palette.common.black,
}));
