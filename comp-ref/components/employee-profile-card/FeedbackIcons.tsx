import React, { FC, memo } from 'react';
import { Box, Typography } from '@mui/material';
import Icon from '@/core/components/icon';
import { IconContainer } from './styled-components';
import { FeedbackIconsProps } from './types';

const FeedbackIcons: FC<FeedbackIconsProps> = ({ likeCount, dislikeCount }) => {
  return (
    <IconContainer container>
      <Box>
        <Icon icon='mdi:thumbs-up' />
        <Typography>{likeCount}</Typography>
      </Box>
      <Box>
        <Icon icon='mdi:thumbs-down' />
        <Typography>{dislikeCount}</Typography>
      </Box>
    </IconContainer>
  );
};

export default memo(FeedbackIcons);
