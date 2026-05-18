import Accordion from '@mui/material/Accordion';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

export const ListHeader = styled(Box)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: theme.typography.fontWeightMedium,
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(1),
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary?.main,
  borderRadius: theme.shape.borderRadius,
}));

export const DataRow = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
}));

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.grey[400]}`,
  borderRadius: `${theme.shape.borderRadius}px !important`,
  overflow: 'hidden',

  '&:last-child': {
    marginBottom: 0,
  },

  '::before': {
    display: 'none',
  },

  '& .summary': {
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
    padding: theme.spacing(0, 2),
    backgroundColor: theme.palette.common.white,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',

    '& .MuiAccordionSummary-expandIconWrapper': {
      color: theme.palette.text.primary,
    },
  },

  '& .MuiAccordionSummary-content': {
    margin: 0,
  },

  '& .details': {
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.common.white,
  },
}));
