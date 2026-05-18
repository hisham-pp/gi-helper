import React from 'react';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ToolTipWrapper } from './styled-components';
import MaterialUITooltip from './ToolTip';
import { NameWithHelperTextProps } from './types';

const TooltipWithHelperText = <T extends { id?: number; name: string }>({
  items,
}: NameWithHelperTextProps<T>) => {
  if (!items?.length) {
    return null;
  }

  const displayedNames = items
    .slice(0, 2)
    .map((item) => item.name)
    .join(', ');

  const remainingItems = items.length > 2 ? items.slice(2) : [];
  const remainingCount = remainingItems.length;

  return (
    <Stack direction='row' spacing={1}>
      <Typography sx={{ fontSize: 12, mr: 2 }}>{displayedNames}</Typography>
      {remainingCount > 0 && (
        <MaterialUITooltip title={remainingItems.map((item) => item.name).join(', ')}>
          <ToolTipWrapper>+{remainingCount}</ToolTipWrapper>
        </MaterialUITooltip>
      )}
    </Stack>
  );
};

export default TooltipWithHelperText;
