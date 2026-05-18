import React, { memo } from 'react';
import { Icon } from '@iconify/react';
import { FilledIconButton, IconWrapper } from './styled-components';

type Props = {
  inProgress?: boolean;
};

const ExportMenuIcon: React.FC<Props> = ({ inProgress = false }) => {
  return (
    <FilledIconButton>
      <IconWrapper
        style={{
          opacity: inProgress ? 1 : 0,
          transform: inProgress ? 'scale(1)' : 'scale(0.8)',
          zIndex: inProgress ? 2 : 1,
        }}
      >
        <Icon icon='line-md:downloading-loop' width={20} height={20} />
      </IconWrapper>

      <IconWrapper
        style={{
          opacity: inProgress ? 0 : 1,
          transform: inProgress ? 'scale(1.2)' : 'scale(1)',
          zIndex: inProgress ? 1 : 2,
        }}
      >
        <Icon icon='solar:menu-dots-bold' width={20} height={20} />
      </IconWrapper>
    </FilledIconButton>
  );
};

export default memo(ExportMenuIcon);
