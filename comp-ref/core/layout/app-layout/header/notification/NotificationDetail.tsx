import React, { FC } from 'react';
import { Box } from '@mui/material';
import UserNotification from '@/types/user-notification';

type Props = {
  notification: UserNotification;
};

const NotificationDetail: FC<Props> = ({ notification }) => {
  return (
    <Box>
      <div
        dangerouslySetInnerHTML={{ __html: notification?.message }}
        className='notification-content'
        style={{ fontSize: 14, fontWeight: 500 }}
      />
    </Box>
  );
};

export default NotificationDetail;
