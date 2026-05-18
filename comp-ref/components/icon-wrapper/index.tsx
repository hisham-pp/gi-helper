import React from 'react';
import { useTheme } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Icon from '@/core/components/icon';

type IconWrapperProps = {
  icon: string;
  color?: SvgIconProps['color'];
  style?: React.CSSProperties;
};

const IconWrapper: React.FC<IconWrapperProps> = ({ icon, color, style }) => {
  const theme = useTheme();

  const iconProps = {
    icon,
    color: color || theme.palette.primary.main,
  };

  return <Icon icon={iconProps.icon} color={iconProps.color} style={style} />;
};

export default IconWrapper;
