import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const ToolTipWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
  textAlign: 'center',
  lineHeight: '16px',
  marginInlineEnd: '4px',
  fontSize: 12,
}));
