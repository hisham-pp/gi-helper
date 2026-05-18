import React, { FC, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { DATE_FORMATS } from '@/constant/date-format';
import { formatDate } from '@/utils/day-utils';
import { capitalizeWords } from '@/utils/enum-utils';
import { TooltipContentWrapper } from './styled-component';
import { TooltipContentProps } from './types';

const { DATE_DD_MMMM_YYYY_HH_MM_AMPM } = DATE_FORMATS;

const TooltipContent: FC<TooltipContentProps> = ({ event, isApproved, isRejected }) => {
  return (
    <TooltipContentWrapper isApproved={isApproved} isRejected={isRejected}>
      <Box className='name-container'>
        <Typography component='span' className='name'>
          {event.title}
        </Typography>
      </Box>

      <Box className='date-container'>
        <Typography className='date'>
          {event.associateDate && formatDate(event.associateDate, DATE_DD_MMMM_YYYY_HH_MM_AMPM)}
        </Typography>
      </Box>

      {event.status && (
        <Box className='status-container'>
          <Typography component='span' className='status'>
            {capitalizeWords(event.status)}
          </Typography>
        </Box>
      )}
    </TooltipContentWrapper>
  );
};

export default memo(TooltipContent);
