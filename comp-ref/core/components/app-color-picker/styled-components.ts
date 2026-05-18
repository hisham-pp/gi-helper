import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export const ColorPickerButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ theme, bgColor = theme.palette.primary.light }) => ({
  backgroundColor: bgColor,
  borderRadius: theme.shape.borderRadius,
  padding: '8px',
  color: '#fff',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  position: 'relative',
}));

export const ColorPickerWrapper = styled('div')({
  position: 'relative',
  display: 'inline-block',
});
