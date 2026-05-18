import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Icon from '@/core/components/icon';
import { useTimelineEvents } from '@/hooks/use-timeline-events';
import { formatLeaveStatus } from '@/utils/status-utils';
import { getStatusStyles } from '../status-chips/status-style';
import { StatusLabel } from '../status-chips/StatusChipLabel';
import TimelineEvent from './timeline/TimelineEvent';
import { StyledAccordionSummary, SummaryContainer } from './styled-components';
import { TimelineAccordionProps } from './types';

const TimelineAccordion: React.FC<TimelineAccordionProps> = ({
  status,
  requestedAt,
  timelineEvents,
  defaultExpanded = false,
  submittedByOnBehalf,
}) => {
  const theme = useTheme();
  const { backgroundColor } = getStatusStyles(theme, status);
  const { events } = useTimelineEvents({
    status,
    requestedAt,
    timelineEvents,
    submittedByOnBehalf,
  });

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      elevation={0}
      sx={{ border: (p) => `1px solid ${p?.palette?.grey[100]}` }}
    >
      <StyledAccordionSummary
        sx={{ backgroundColor }}
        expandIcon={<Icon icon='si:expand-more-duotone' />}
      >
        <SummaryContainer>
          <Typography className='title'>Timeline</Typography>
          <StatusLabel fontSize={13} status={formatLeaveStatus(status)} />
        </SummaryContainer>
      </StyledAccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ p: 1.5 }}>
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id || `event-${index}`}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TimelineAccordion;
