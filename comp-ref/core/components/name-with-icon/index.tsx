import { FC } from 'react';
import { CSSProperties } from 'react';
import { Box, SxProps } from '@mui/material';
import colors from '@/utils/colors';
import Icon from '../icon';

type NameWithIconProps = {
  icon: string;
  name?: string;
  iconSize?: number;
  sx?: SxProps;
  iconStyle?: CSSProperties;
  iconColor?: string;
};

const NameWithIcon: FC<NameWithIconProps> = ({
  icon,
  name,
  iconSize = 35,
  sx,
  iconStyle,
  iconColor = colors.primary.kieworkBlack,
}) => {
  return (
    <Box display='flex' alignItems='center' sx={{ whiteSpace: 'nowrap', ...sx }}>
      {name}
      <Icon icon={icon} fontSize={iconSize} color={iconColor} style={{ ...iconStyle }} />
    </Box>
  );
};

export default NameWithIcon;
