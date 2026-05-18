import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

export const ChipContainer = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1,
  width: '100%',
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '6px',
  height: 28,
  maxWidth: '95%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '.MuiChip-label': {
    fontSize: 12,
  },
  '.MuiChip-deleteIcon': {
    fontSize: 16,
    color: theme.palette.common.white,
  },
}));

export const BoxWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  rowGap: theme.spacing(2),
  gap: theme.spacing(2),
}));
