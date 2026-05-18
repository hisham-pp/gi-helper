import Link from 'next/link';
import React, { useState } from 'react';
import AppButton from '../button';
import { NavigationButtonProps } from './types';

const NavigationButton: React.FC<NavigationButtonProps> = ({
  href,
  loadingText = 'Loading...',
  openInNewTab = false,
  children,
  onClick,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    onClick?.(event);
  };

  const linkProps = {
    href,
    ...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  };

  return (
    <AppButton component={Link} onClick={handleClick} loading={isLoading} {...linkProps} {...rest}>
      {isLoading ? loadingText : children}
    </AppButton>
  );
};

export default NavigationButton;
