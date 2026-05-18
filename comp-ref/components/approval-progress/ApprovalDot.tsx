'use client';

import React, { memo, useMemo } from 'react';
import { Box } from '@mui/material';
import AppTooltip from '@/core/components/app-tooltip';
import { StatusEnumeration } from '@/enums/status';
import { ApprovalDotWrapper } from './styled-component';
import TooltipContent from './TooltipContent';
import { ApprovalDotProps } from './types';

const {
  APPROVED,
  REJECTED,
  PENDING,
  CANCELLATION_APPROVED,
  CANCELLATION_INITIATED,
  CANCELLATION_REJECTED,
  CANCELLED_APPROVED,
  CANCELLED,
} = StatusEnumeration;

const ApprovalDot: React.FC<ApprovalDotProps> = ({ event, isFirst, size = 'medium' }) => {
  const dotSize = useMemo(() => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      default:
        return 12;
    }
  }, [size]);

  const lineWidth = useMemo(() => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  }, [size]);

  const isApproved = useMemo(
    () =>
      event.status === APPROVED ||
      event?.status === CANCELLATION_APPROVED ||
      event?.status === CANCELLED_APPROVED,
    [event],
  );
  const isRejected = useMemo(
    () =>
      event.status === REJECTED ||
      event?.status === CANCELLATION_REJECTED ||
      event?.status === CANCELLED,
    [event],
  );
  const isPending = useMemo(
    () => event.status === PENDING || event?.status === CANCELLATION_INITIATED,
    [event],
  );

  return (
    <ApprovalDotWrapper
      dotSize={dotSize}
      isApproved={isApproved || isFirst}
      isRejected={isRejected}
      lineWidth={lineWidth}
      isPending={isPending}
    >
      {!isFirst && <Box className='approval-line' />}
      <AppTooltip
        title={<TooltipContent event={event} isApproved={isApproved} isRejected={isRejected} />}
      >
        <Box className='approval-dot' />
      </AppTooltip>
    </ApprovalDotWrapper>
  );
};

export default memo(ApprovalDot);
