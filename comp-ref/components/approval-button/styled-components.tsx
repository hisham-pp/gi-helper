import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const CustomButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
  padding: 4,
  minWidth: 8,
  borderRadius: 5,
}));
