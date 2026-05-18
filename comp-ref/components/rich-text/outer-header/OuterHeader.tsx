import React from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Icon from '@/core/components/icon';
import { OuterHeaderProps } from '../types';
import { HeaderContainer } from './styled-components';

const OuterHeader: React.FC<OuterHeaderProps> = ({
  header = '',
  showPreviewButton = true,
  isPreview,
  togglePreview,
}) => {
  const icon = !isPreview ? 'lucide:view' : 'uil:edit';

  return (
    <HeaderContainer>
      <Typography className='header'>{header}</Typography>
      {showPreviewButton && (
        <IconButton sx={{ p: 0 }} onClick={togglePreview}>
          <Icon fontSize={18} icon={icon} />
        </IconButton>
      )}
    </HeaderContainer>
  );
};

export default OuterHeader;
