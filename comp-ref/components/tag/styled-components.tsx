import Box, { BoxProps } from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

export const StyledChip = styled(Chip)(({ color }) => ({
  borderRadius: '6px',
  height: '25px',
  fontSize: '12px',
  color: colors.common.white,
  backgroundColor: color,
}));

export const TagTipWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  borderRadius: '6px',
  height: '25px',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 3),
  color: theme.palette.common.white,
  background: theme.palette.primary.main,
}));

export const TagOption = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isFocused',
})<{ isFocused?: boolean }>(({ theme, isFocused }) => ({
  cursor: 'pointer',
  backgroundColor: isFocused ? theme.palette.action.hover : '',
  padding: theme.spacing(3, 4),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),

  '& .label': {
    fontSize: 13,
  },
}));
