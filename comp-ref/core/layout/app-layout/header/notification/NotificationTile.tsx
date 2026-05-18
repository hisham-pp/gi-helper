import React, { FC } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import Icon from '@/core/components/icon';
import UserNotification from '@/types/user-notification';
import colors from '@/utils/colors';
import { getNotificationTime } from '@/utils/day-utils';
import { StyledTile } from '../styled-components';

type Props = {
  notification: UserNotification;
  isUnread: boolean;
  handleTileClick: (notification: UserNotification) => void;
};

const NotificationTile: FC<Props> = ({ notification, handleTileClick, isUnread }) => {
  const { shortMessage, title, createdAt } = notification;

  return (
    <>
      <StyledTile onClick={() => handleTileClick(notification)} isUnread={isUnread}>
        <Box className='title-wrapper'>
          {isUnread && (
            <Icon
              icon='bxs:circle'
              fontSize={8}
              style={{
                color: colors.primary.kieworkBlueDark,
                filter: `drop-shadow(0 0 2px ${colors.primary.kieworkBlueDark})`,
              }}
            />
          )}
          <Typography className={`title ${isUnread ? 'unread-title' : ''}`}>{title}</Typography>
        </Box>
        <Typography className={`short-message ${isUnread ? 'unread-short-message' : ''}`}>
          {shortMessage}
        </Typography>
        <Typography
          className={`notified-day ${isUnread ? 'unread-notified-day' : ''}`}
          variant='caption'
        >
          {getNotificationTime(createdAt as string)}
        </Typography>
      </StyledTile>
      <Divider />
    </>
  );
};

export default NotificationTile;
