'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import icons from '@/configs/icons';
import Icon from '@/core/components/icon';
import { StatusEnumeration } from '@/enums/status';
import { CustomButton } from './styled-components';

type Props = {
  finalStatus?: StatusEnumeration;
  userStatus?: StatusEnumeration;
  onApprove: () => void;
  onReject?: () => void;
};

const { PENDING, CANCELLATION_INITIATED } = StatusEnumeration;

icons.loadIcons(['mdi:tick', 'charm:cross']);

const ApprovalButton = ({ finalStatus, userStatus, onApprove, onReject }: Props) => {
  const theme = useTheme();

  const isAllowed = useMemo(() => {
    const isAllowedFinalStatus = finalStatus !== CANCELLATION_INITIATED && finalStatus !== PENDING;
    const isAllowedUserStatus = userStatus !== CANCELLATION_INITIATED && userStatus !== PENDING;
    return isAllowedFinalStatus || isAllowedUserStatus;
  }, [finalStatus, userStatus]);

  if (isAllowed) {
    return null;
  }

  const renderButton = (color: string, icon: string, onClick?: () => void) => {
    return (
      <CustomButton
        variant='contained'
        sx={{ background: `${color}!important` }}
        onClick={onClick}
        disabled={!onClick}
      >
        <Icon icon={icon} />
      </CustomButton>
    );
  };

  return (
    <Grid container gap={1} sx={{ minWidth: 70 }}>
      {renderButton(theme?.palette.success.main, 'mdi:tick', onApprove)}
      {onReject && renderButton(theme?.palette.error.main, 'charm:cross', onReject)}
    </Grid>
  );
};

export default ApprovalButton;
