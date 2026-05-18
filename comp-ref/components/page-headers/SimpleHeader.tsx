import React from 'react';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Icon from '@/core/components/icon';
import Translations from '@/core/components/translations';
import { SimplePaper, Title } from './styled-components';
import { SimpleHeaderProps } from './types';

const fontSizes = { small: 14, medium: 15, large: 16 };

const SimpleHeader: React.FC<SimpleHeaderProps> = (props) => {
  const {
    title,
    renderTitleEnd,
    titleSize = 'medium',
    titleWeight = 'bold',
    showBackArrow = false,
    paperProps = {},
    variant = 'standard',
    onBackClick,
  } = props;

  const { sx: paperSx, elevation, ...paperPropsRest } = paperProps;

  const theme = useTheme();

  const fontWeights = {
    light: theme.typography.fontWeightRegular,
    medium: theme.typography.fontWeightMedium,
    bold: theme.typography.fontWeightBold,
  };

  const arrowDir = theme.direction == 'rtl' ? 'rotate(-180deg)' : '';
  const renderTitle = () => (
    <Title
      component='div'
      fontSize={fontSizes[titleSize]}
      fontWeight={String(fontWeights[titleWeight])}
    >
      {showBackArrow && (
        <IconButton onClick={onBackClick} sx={{ transform: arrowDir }}>
          <Icon icon='eva:arrow-back-outline' color='black' />
        </IconButton>
      )}
      {typeof title === 'string' ? <Translations text={title} /> : title}
    </Title>
  );

  return (
    <SimplePaper
      elevation={variant === 'standard' ? 0 : elevation}
      sx={{ ...paperSx, ...(variant === 'standard' && { boxShadow: 'none' }) }}
      {...paperPropsRest}
    >
      {renderTitle()}
      {renderTitleEnd || null}
    </SimplePaper>
  );
};

export default SimpleHeader;
