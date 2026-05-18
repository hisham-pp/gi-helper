'use client';

import React, { memo, useMemo } from 'react';
import { Stack, Tooltip } from '@mui/material';
import colors from '@/utils/colors';
import hexToRGBA from '@/utils/hex-to-rgba';
import { TooltipTypography } from './styled-components';

type TextWithTooltipProps = {
  names: string[];
  maxVisible?: number;
};

const TextWithTooltip: React.FC<TextWithTooltipProps> = ({ names, maxVisible = 2 }) => {
  const displayedNames = useMemo(() => names.slice(0, maxVisible), [names, maxVisible]);
  const remainingCount = names.length - maxVisible;

  return (
    <Stack direction='row' spacing={1}>
      {displayedNames.map((name, index) => (
        <TooltipTypography key={index} variant='body2'>
          {name}
          {index < displayedNames.length - 1 && ', '}
        </TooltipTypography>
      ))}
      {remainingCount > 0 && (
        <Tooltip
          title={names.slice(maxVisible).join(', ')}
          arrow
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: colors.common.white,
                color: colors.common.black,
                padding: '8px 12px',
                boxShadow: `0px 4px 12px ${hexToRGBA(colors.common.black, 0.2)}`,
                borderRadius: '4px',
              },
            },
          }}
        >
          <TooltipTypography variant='body2'>+{remainingCount} more</TooltipTypography>
        </Tooltip>
      )}
    </Stack>
  );
};

export default memo(TextWithTooltip);
