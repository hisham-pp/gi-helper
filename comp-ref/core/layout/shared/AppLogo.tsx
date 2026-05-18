'use client';

import { memo } from 'react';
import { Box } from '@mui/material';
import { BRAND_LOGO, FAVICON } from '@/configs/image-paths';
import { ROUTES } from '@/constant/routes';
import AppImage from '@/core/components/app-image/AppImage';
import useAuth from '@/hooks/use-auth';
import { imgPath } from '@/utils/file-utils';
import { LogoWrapper } from './styled-components';

type AppLogoProps = {
  showSecondaryLogo?: boolean;
};

const AppLogo = ({ showSecondaryLogo = false }: AppLogoProps) => {
  const { user } = useAuth();

  return (
    <LogoWrapper href={ROUTES.quickNav?.root?.path} showSecondaryLogo={showSecondaryLogo}>
      <Box className='expanded-logo'>
        <AppImage
          loader={({ src }) => src}
          src={imgPath(user?.company?.companyLogo)}
          alt='app-logo'
          fallBack={BRAND_LOGO}
          width={140}
          height={36}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box className='collapsed-logo'>
        <AppImage
          loader={({ src }) => src}
          src={imgPath(user?.company?.secondaryLogo as string)}
          fallBack={FAVICON}
          alt='app-logo-collapsed'
          width={36}
          height={36}
          style={{ objectFit: 'contain' }}
        />
      </Box>
    </LogoWrapper>
  );
};

export default memo(AppLogo);
