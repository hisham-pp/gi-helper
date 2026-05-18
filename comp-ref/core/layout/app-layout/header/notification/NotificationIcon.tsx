import React from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Icon from '@/core/components/icon';

type Props = {
  unreadNotificationCount?: number;
  onClick?: () => void;
};

const NotificationIcon: React.FC<Props> = ({ unreadNotificationCount, onClick }) => {
  return (
    <IconButton
      color='inherit'
      aria-haspopup='true'
      aria-controls='customized-menu'
      onClick={onClick}
    >
      <Badge
        color='error'
        badgeContent={unreadNotificationCount}
        sx={{
          '& .MuiBadge-badge': {
            top: 3,
            right: 3,
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
          },
        }}
      >
        <Icon icon='bx:bell' />
      </Badge>
    </IconButton>
  );
};

export default NotificationIcon;
