import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography, { TypographyProps } from '@mui/material/Typography';
import colors from '@/utils/colors';
import hexToRGBA from '@/utils/hex-to-rgba';

export const StyledTypography = styled(Typography)<{ titlestyles?: object }>(({ titlestyles }) => ({
  padding: '6px 12px',
  fontWeight: 500,
  fontSize: 13,
  ...(titlestyles && titlestyles),
}));

export const StyledTable = styled(Table)(({ theme }) => ({
  border: 'none',

  '& .MuiTableCell-root': {
    border: 'none',
  },

  '& .table-row': {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
  },

  '& .table-cell': {
    fontSize: '12px',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    color: theme.palette.primary.contrastText,
    textAlign: 'left',
  },

  '& .table-cell-right': {
    fontSize: '12px',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    color: theme.palette.primary.contrastText,
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
}));

export const StyledTableRow = styled(TableRow)({
  display: 'flex',
  alignItems: 'center',
});

export const StyledTableCell = styled(TableCell)({
  display: 'inline-block',
  textAlign: 'left',
  padding: '6px 8px',
});

export const StyledTableCellRight = styled(TableCell)<{ value?: number | string | null }>(
  ({ value, theme }) => ({
    textAlign: 'right',
    whiteSpace: 'nowrap',
    flexBasis: '250px',
    flex: 1,
    padding: '6px 8px',
    color: Number(value) < 0 ? theme.palette.error.main : undefined,
  }),
);

export const StyledFooter = styled(Box)({
  backgroundColor: colors.lightShades.lightBlue,
  paddingTop: '4px',
  paddingBottom: '4px',
  marginTop: '4px',
});

export const CustomTextField = styled(TextField)(({ theme }) => ({
  width: '60%',
  '& .MuiInputBase-root': {
    borderRadius: 4,
    overflow: 'hidden',
    padding: 0,
  },

  '& .MuiInputAdornment-positionEnd': {
    padding: '19px 9px',
    backgroundColor: theme.palette.grey[200],
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
  },

  '& input': {
    textAlign: 'right',
  },
}));

export const ComponentLabel = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontSize: '13px',
  color: theme.palette.text.secondary,

  '& .percentage': {
    display: 'block',
    fontSize: 11,
    color: theme.palette.grey[400],
  },

  '& .tag': {
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.5),
    color: theme.palette.common.white,
    padding: theme.spacing(0.25, 2),
    borderRadius: '4px',
    fontSize: 12,
    fontWeight: 'normal',
    marginLeft: theme.spacing(1.5),
  },
}));

export const FixedAmountLabel = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  fontFamily: 'monospace',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.action.hover,
  borderRadius: '4px',
  padding: '2px 8px',
  display: 'inline-block',
}));
