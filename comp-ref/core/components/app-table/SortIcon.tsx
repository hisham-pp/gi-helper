import { memo } from 'react';
import Box from '@mui/material/Box';
import { SortOrder } from '@/enums/common';
import Icon from '../icon';

type SortIconProps = {
  isActive: boolean;
  order?: SortOrder;
};

const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const smooth = 'cubic-bezier(0.4, 0, 0.2, 1)';

const SortIcon = ({ isActive, order }: SortIconProps) => {
  const isAsc = isActive && order === SortOrder.ASC;
  const isDesc = isActive && order === SortOrder.DESC;

  const activeTransform = isAsc
    ? 'rotate(0deg) scale(1)'
    : isDesc
      ? 'rotate(180deg) scale(1)'
      : 'rotate(0deg) scale(1)';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 25,
        height: 25,
      }}
    >
      {/* Idle icon */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          opacity: isActive ? 0 : 0.5,
          transform: isActive ? 'scale(0.4) rotate(90deg)' : 'scale(1) rotate(0deg)',
          transition: `opacity 0.4s ${smooth}, transform 0.5s ${spring}`,
          willChange: 'transform, opacity',
        }}
      >
        <Icon icon='si:sort-alt-fill' fontSize={16} />
      </Box>

      {/* Active icon — rotates 180deg for ASC↔DESC */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          opacity: isActive ? 1 : 0,
          transform: isActive ? activeTransform : 'scale(0.4) rotate(-90deg)',
          transition: `opacity 0.4s ${smooth}, transform 0.5s ${spring}`,
          transformOrigin: 'center center',
          willChange: 'transform, opacity',
        }}
      >
        <Icon icon='lucide:sort-asc' fontSize={16} />
      </Box>
    </Box>
  );
};

export default memo(SortIcon);
