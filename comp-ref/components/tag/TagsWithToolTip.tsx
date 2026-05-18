'use client';

import React, { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import hexToRGBA from '@/utils/hex-to-rgba';
import { InfoTip } from '../tool-tip';
import { TagTipWrapper } from './styled-components';
import TagChip from './TagChip';
import { TagsWithTooltipProps } from './types';

const TagsWithTooltip: React.FC<TagsWithTooltipProps> = ({ items, limit = 3 }) => {
  const theme = useTheme();

  const displayedItems = useMemo(() => items?.slice(0, limit) || [], [items, limit]);
  const remainingItems = useMemo(
    () => (items && items.length > limit ? items.slice(limit) : []),
    [items, limit],
  );
  const remainingCount = remainingItems.length;

  const tooltipContent = useMemo(
    () => (
      <Stack
        direction='row'
        gap={1}
        sx={{
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
      >
        {remainingItems.map((item) => (
          <TagChip key={item.name} name={item.name} color={item.color} truncate={false} />
        ))}
      </Stack>
    ),
    [remainingItems],
  );

  if (!items?.length) {
    return null;
  }

  return (
    <Stack direction='row' spacing={1}>
      {displayedItems.map((item, index) => (
        <TagChip key={index} name={item.name} color={item.color} />
      ))}
      {remainingCount > 0 && (
        <InfoTip
          title={tooltipContent}
          arrow={false}
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: hexToRGBA(theme.palette.primary.main, 0.7),
              },
            },
          }}
        >
          <TagTipWrapper>+{remainingCount}</TagTipWrapper>
        </InfoTip>
      )}
    </Stack>
  );
};

export default TagsWithTooltip;
