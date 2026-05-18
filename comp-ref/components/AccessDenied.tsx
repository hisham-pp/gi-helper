import React, { ReactNode } from 'react';
import { Stack, SxProps, Theme, Typography, useTheme } from '@mui/material';
import Icon from '@/core/components/icon';

type Props = {
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

const AccessDenied: React.FC<Props> = ({ title = 'Access Denied', description, children, sx }) => {
  const { palette } = useTheme();

  return (
    <Stack alignItems='center' spacing={2} p={3} sx={sx}>
      <Icon icon='mdi:shield-lock-outline' fontSize={64} color={palette.error.main} />
      <Typography variant='h5' fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography color='text.secondary' textAlign='center' maxWidth={420}>
          {description}
        </Typography>
      )}
      {children}
    </Stack>
  );
};

export default AccessDenied;
