'use client';

import React, { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { getStatusStyles } from '@/components/status-chips/status-style';
import { capitalizeWords } from '@/utils/enum-utils';
import { StatusChipCard, StatusChipLabel } from './styled-components';
import { StatusChip as StatusChipType, StatusLabelProps } from './types';

export const StatusLabel = memo(({ status, fontSize, label }: StatusLabelProps) => {
  const theme = useTheme();
  const { color } = getStatusStyles(theme, status);

  return (
    <StatusChipLabel sx={{ color, fontSize }}>{label || capitalizeWords(status)}</StatusChipLabel>
  );
});

StatusLabel.displayName = 'StatusLabel';

const StatusChip: React.FC<StatusChipType> = ({ status, chipStyle, label }) => {
  const theme = useTheme();
  const { backgroundColor } = getStatusStyles(theme, status);

  return (
    <StatusChipCard sx={{ backgroundColor, ...chipStyle }}>
      <StatusLabel status={status} label={label} />
    </StatusChipCard>
  );
};

export default memo(StatusChip);
