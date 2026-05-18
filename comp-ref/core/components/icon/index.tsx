import { Icon as IconifyIcon, IconProps } from '@iconify/react';

const Icon = ({ icon, fontSize = 20, ...rest }: IconProps) => {
  return <IconifyIcon icon={icon} fontSize={`${fontSize}px`} {...rest} />;
};

export default Icon;
