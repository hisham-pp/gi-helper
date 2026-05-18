'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { PlateElement, type PlateElementProps } from '@udecode/plate/react';
import { type PlaceholderElement as PlaceholderType } from '../types';

interface PlaceholderProps extends PlateElementProps {
  element: PlaceholderType;
}

export const PlaceholderChip: React.FC<PlaceholderProps> = ({ children, element, ...props }) => {
  return (
    <PlateElement {...props} element={element} as='span'>
      <Chip
        label={`{{${element.label || element.field}}}`}
        size='small'
        color='primary'
        variant='outlined'
        contentEditable={false}
        sx={{
          height: 22,
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'default',
          verticalAlign: 'baseline',
          '& .MuiChip-label': { px: 1 },
        }}
      />
      {children}
    </PlateElement>
  );
};
