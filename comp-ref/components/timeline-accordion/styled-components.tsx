import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.shape.borderRadius,
  paddingRight: theme.spacing(2),
  minHeight: 36,
  maxHeight: 36,

  '&.Mui-expanded': {
    minHeight: 36,
    maxHeight: 36,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  '& svg': {
    fontSize: 22,
    color: theme.palette.common.black,
  },
}));

export const SummaryContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: theme.spacing(1),

  '& .title': {
    color: theme.palette.common.black,
    fontSize: '14px',
    fontWeight: theme.typography.fontWeightMedium,
  },
}));
