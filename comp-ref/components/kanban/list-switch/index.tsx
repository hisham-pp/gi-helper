'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { memo, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Icon from '@/core/components/icon';
import { ButtonTrack } from './styled-components';
import { KanbanListSwitchProps } from './types';

const KanbanListSwitch: React.FC<KanbanListSwitchProps> = ({ active }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const handleChange = useCallback(() => {
    const newSearchParam = new URLSearchParams(searchParams);
    const newPath = active === 'list' ? `${pathname}/kanban` : pathname.replace('/kanban', '');

    push(`${newPath}?${newSearchParam}`);
  }, [active, pathname, searchParams, push]);

  const renderButton = useCallback(
    (icon: string, isActive?: boolean) => {
      return (
        <IconButton
          size='small'
          disableRipple
          onClick={handleChange}
          sx={{
            ...(isActive && { backgroundColor: 'white', boxShadow: theme.shadows[5] }),
          }}
        >
          <Icon icon={icon} />
        </IconButton>
      );
    },
    [theme.shadows, handleChange],
  );

  return (
    <ButtonTrack>
      {renderButton('ph:list', active === 'list')}
      {renderButton('fluent:board-split-24-filled', active === 'kanban')}
    </ButtonTrack>
  );
};

export default memo(KanbanListSwitch);
