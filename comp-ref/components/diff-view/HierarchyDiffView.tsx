'use client';

import React, { memo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import StatusChip from '@/components/status-chips/StatusChipLabel';
import Icon from '@/core/components/icon';
import { StatusEnumeration } from '@/enums/status';

export type DiffRowStatus = 'KEEP' | 'CHANGED' | 'PENDING' | 'INVALID';

export type DiffRow = {
  /** Human label e.g. "Department" */
  label: string;
  /** Current value display (string or React node) */
  from?: React.ReactNode;
  /** Target value display (string or React node — undefined renders dash) */
  to?: React.ReactNode;
  /** Visual status — drives chip + row tint */
  status?: DiffRowStatus;
  /** Optional helper line below the row */
  helperText?: string;
};

export type HierarchyDiffViewProps = {
  /** Title rendered above the diff (optional) */
  title?: string;
  /** Header text for the "from" column (default: Current) */
  fromHeader?: string;
  /** Header text for the "to" column (default: Target) */
  toHeader?: string;
  /** Rows to render */
  rows: DiffRow[];
  /** Render value as monospace */
  dense?: boolean;
};

const STATUS_CHIP_LABEL: Record<DiffRowStatus, string> = {
  KEEP: 'Keep',
  CHANGED: 'Updated',
  PENDING: 'Required',
  INVALID: 'Invalid',
};

const STATUS_CHIP_TYPE: Record<DiffRowStatus, StatusEnumeration> = {
  KEEP: StatusEnumeration.ACTIVE,
  CHANGED: StatusEnumeration.APPROVED,
  PENDING: StatusEnumeration.PENDING,
  INVALID: StatusEnumeration.REJECTED,
};

const renderValue = (value: React.ReactNode, dense: boolean | undefined) => {
  if (value === undefined || value === null || value === '') {
    return (
      <Typography variant='body2' color='text.disabled'>
        —
      </Typography>
    );
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Typography
        variant='body2'
        sx={{
          fontFamily: dense ? 'monospace' : undefined,
          color: 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    );
  }
  return value;
};

/**
 * Generic Old → New diff display for hierarchy or master changes.
 * Reusable across Employee Transfer, future Promotion/Demotion flows, etc.
 */
const HierarchyDiffView: React.FC<HierarchyDiffViewProps> = ({
  title,
  fromHeader = 'Current',
  toHeader = 'Target',
  rows,
  dense,
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {title ? (
        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      ) : null}

      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1.2fr 1.6fr 32px 1.6fr 110px',
            },
            alignItems: 'center',
            px: 2,
            py: 1.25,
            backgroundColor: theme.palette.action.hover,
            borderBottom: `1px solid ${theme.palette.divider}`,
            gap: 1,
          }}
        >
          <Typography variant='caption' sx={{ fontWeight: 600 }}>
            Field
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600 }}>
            {fromHeader}
          </Typography>
          <span />
          <Typography variant='caption' sx={{ fontWeight: 600 }}>
            {toHeader}
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, textAlign: 'right' }}>
            Status
          </Typography>
        </Box>

        {rows.map((row, idx) => {
          const status = row.status ?? 'KEEP';
          const isInvalid = status === 'INVALID';
          return (
            <Box
              key={`${row.label}-${idx}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1.2fr 1.6fr 32px 1.6fr 110px',
                },
                alignItems: 'center',
                px: 2,
                py: 1.5,
                gap: 1,
                borderBottom:
                  idx === rows.length - 1 ? 'none' : `1px solid ${theme.palette.divider}`,
                backgroundColor: isInvalid ? theme.palette.error.light + '14' : 'transparent',
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {row.label}
              </Typography>
              <Box>{renderValue(row.from, dense)}</Box>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <Icon icon='iconamoon:arrow-right-2' fontSize={18} />
              </Box>
              <Box>{renderValue(row.to, dense)}</Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <StatusChip status={STATUS_CHIP_TYPE[status]} label={STATUS_CHIP_LABEL[status]} />
              </Box>
              {row.helperText ? (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                >
                  {row.helperText}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default memo(HierarchyDiffView);
