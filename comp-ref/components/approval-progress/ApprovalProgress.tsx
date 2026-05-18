import React, { memo } from 'react';
import { SortOrder } from '@/enums/common';
import { useTimelineEvents } from '@/hooks/use-timeline-events';
import ApprovalDot from './ApprovalDot';
import { TimelineWrapper } from './styled-component';
import { ApprovalProgressProps } from './types';

const ApprovalProgress: React.FC<ApprovalProgressProps> = ({
  timelineEvents = [],
  requestedAt,
  status,
  size = 'medium',
}) => {
  const { events } = useTimelineEvents({
    status,
    requestedAt,
    timelineEvents,
    sortOrder: SortOrder.ASC,
  });

  if (!events || events.length <= 0) {
    return null;
  }

  return (
    <TimelineWrapper>
      {events.map((event, index) => (
        <ApprovalDot key={event.id} event={event} isFirst={index === 0} size={size} />
      ))}
    </TimelineWrapper>
  );
};

export default memo(ApprovalProgress);
