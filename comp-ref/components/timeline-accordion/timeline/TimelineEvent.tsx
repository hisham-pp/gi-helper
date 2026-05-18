'use client';

import React, { memo, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import { StatusLabel } from '@/components/status-chips/StatusChipLabel';
import { DATE_FORMATS } from '@/constant/date-format';
import Icon from '@/core/components/icon';
import { formatDate } from '@/utils/day-utils';
import { TimelineEventProps } from '../types';
import {
  StyledTooltip,
  TimelineDot,
  TimelineEventContainer,
  TimelineEventHeader,
  TimelineLine,
} from './styled-components';

const { DATE_DD_MMMM_YYYY_HH_MM_AMPM } = DATE_FORMATS;

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, isLast }) => {
  const [selectedCommentId, setSelectedCommentId] = useState<null | number>(null);

  const handleCleanCommentId = useCallback(
    () => setSelectedCommentId(null),
    [setSelectedCommentId],
  );

  const handleCommentClick = useCallback(
    (id: number | null) => () => setSelectedCommentId(id),
    [setSelectedCommentId],
  );

  return (
    <TimelineEventContainer isLast={isLast}>
      {!isLast && <TimelineLine isPassed={event.isPassed} />}
      <TimelineDot isPassed={event.isPassed} />
      <TimelineEventHeader>
        <Typography className='name'>{event.title}</Typography>
        <Typography className='associate-date'>
          {formatDate(event.associateDate, DATE_DD_MMMM_YYYY_HH_MM_AMPM)}
        </Typography>
        {event.subtitle && (
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            {event.subtitle}
          </Typography>
        )}
        <Box display='flex' alignItems='center'>
          {event.status && <StatusLabel status={event.status} />}
          {event.comments && (
            <ClickAwayListener onClickAway={handleCleanCommentId}>
              <div onClick={(e) => e.preventDefault()}>
                <StyledTooltip
                  arrow
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  placement='bottom-start'
                  open={event.id === selectedCommentId}
                  title={event.comments}
                  onClose={handleCleanCommentId}
                  slots={{ transition: Zoom }}
                  slotProps={{ popper: { disablePortal: true } }}
                >
                  <IconButton sx={{ ml: 1 }} onClick={handleCommentClick(event.id || null)}>
                    <Icon icon='mage:message-dots' fontSize={16} />
                  </IconButton>
                </StyledTooltip>
              </div>
            </ClickAwayListener>
          )}
        </Box>
      </TimelineEventHeader>
    </TimelineEventContainer>
  );
};

export default memo(TimelineEvent);
