'use client';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: theme.palette.gradients?.primary,
  '& th': {
    fontSize: '12px',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    color: theme.palette.common.white,
  },
}));

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`,
  overflowX: 'auto',

  '& tbody td': {
    fontSize: 12,
    paddingTop: theme.spacing(1.7),
    paddingBottom: theme.spacing(1.7),
  },

  [theme.breakpoints.down('md')]: {
    '& table': {
      minWidth: 600,
    },
    '& th, & td': {
      fontSize: 12,
      padding: theme.spacing(0.75),
      whiteSpace: 'nowrap',
    },
  },

  [theme.breakpoints.down('sm')]: {
    '& table': {
      minWidth: 500,
    },
    '& th, & td': {
      fontSize: 12,
      padding: theme.spacing(0.5),
    },
  },
}));

export const StyledTableRow = styled(TableRow)(() => ({
  '&:nth-of-type(odd)': {},

  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Sorting components
export const SortableHeaderWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSortable' && prop !== 'align',
})<{
  isSortable?: boolean;
  align?: 'left' | 'center' | 'right' | 'inherit' | 'justify';
}>(({ isSortable, align }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: isSortable ? 'pointer' : 'default',
  userSelect: 'none',
  justifyContent:
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'flex-end'
        : align === 'justify'
          ? 'space-between'
          : 'flex-start',
}));
