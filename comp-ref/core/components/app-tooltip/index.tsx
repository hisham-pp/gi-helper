'use client';

import React from 'react';
import { Tooltip, Zoom } from '@mui/material';
import { AppTooltipProps } from './types';

const AppTooltip: React.FC<AppTooltipProps> = ({ children, arrow = true, ...props }) => {
  return (
    <Tooltip
      arrow={arrow}
      slots={{ transition: Zoom }}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -3],
              },
            },
          ],
        },
        tooltip: {
          sx: (theme) => ({
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[5],
            borderRadius: 1,
            padding: theme.spacing(1),
            maxWidth: 500,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
        arrow: {
          sx: (theme) => ({
            color: theme.palette.background.default,
            '&::before': {
              border: `1px solid ${theme.palette.divider}`,
            },
          }),
        },
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default AppTooltip;
