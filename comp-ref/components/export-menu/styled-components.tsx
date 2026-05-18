import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export const FilledIconButton = styled(IconButton)(({ theme: { palette } }) => ({
  minHeight: 35,
  minWidth: '35px !important',
  backgroundColor: palette.primary.main,
  color: palette.common.white,
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    backgroundColor: palette.primary.dark,
  },
}));

export const IconWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});
