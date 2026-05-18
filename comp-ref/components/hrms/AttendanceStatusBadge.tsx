import React, { FC, memo } from 'react';
import { Chip } from '@mui/material';
import Icon from '@/core/components/icon';
import { ProjectAttendanceStatus } from '@/types/hrms/project-assignment';

interface AttendanceStatusBadgeProps {
  status: ProjectAttendanceStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const statusConfig = {
  [ProjectAttendanceStatus.PENDING]: {
    label: 'Pending',
    color: 'default' as const,
    icon: <Icon icon='mdi:schedule' />,
  },
  [ProjectAttendanceStatus.PRESENT]: {
    label: 'Present',
    color: 'success' as const,
    icon: <Icon icon='mdi:check-circle' />,
  },
  [ProjectAttendanceStatus.ABSENT]: {
    label: 'Absent',
    color: 'error' as const,
    icon: <Icon icon='mdi:cancel' />,
  },
};

const AttendanceStatusBadge: FC<AttendanceStatusBadgeProps> = ({
  status,
  size = 'small',
  variant = 'filled',
}) => {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      icon={config.icon}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? '16px' : '20px',
        },
      }}
    />
  );
};

export default memo(AttendanceStatusBadge);
