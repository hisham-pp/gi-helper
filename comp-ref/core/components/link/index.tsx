import React from 'react';
import { Link } from './styled-components';
import { Props } from './types';

const AppLink: React.FC<Props> = ({ to = '', children, sx, target }) => {
  return (
    <Link href={to} target={target} sx={sx}>
      {children}
    </Link>
  );
};

export default AppLink;
