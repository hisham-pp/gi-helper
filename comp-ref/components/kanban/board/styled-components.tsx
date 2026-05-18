'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import colors from '@/utils/colors';

const { lightShades } = colors;

export const ColumnContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  height: '100%',
  overflowX: 'auto',
  willChange: 'scroll-position',
}));

export const ColumnPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color = 'primary.main' }) => ({
  backgroundColor: lightShades.lightGrayishBlue,
  minWidth: 350,
  maxWidth: 350,
  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
  '&.dragging': {
    boxShadow: theme.shadows[8],
    opacity: 0.8,
  },

  '& .column-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `2px solid ${color}`,
    padding: theme.spacing(2),
    height: '8%',
    cursor: 'grab',
    userSelect: 'none',
    '&:active': {
      cursor: 'grabbing',
    },

    '& .header-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
    },

    '& .header': {
      color,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightMedium,
    },

    '& .item-count': {
      fontSize: 11,
      padding: theme.spacing(0.5, 2),
      backgroundColor: lightShades.lightMist,
      borderRadius: '50%',
      fontWeight: theme.typography.fontWeightMedium,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  '& .item-wrapper': {
    height: '92%',
    overflowY: 'auto',
    overflowX: 'hidden',
    willChange: 'scroll-position',
    padding: theme.spacing(2),
  },
}));
