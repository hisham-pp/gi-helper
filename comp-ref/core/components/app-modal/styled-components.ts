import Grid, { GridProps } from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

export const ModalMain = styled(Grid)<GridProps>(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));
