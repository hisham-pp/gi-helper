import React from 'react';
import { Card } from '@mui/material';
import Box from '@mui/material/Box';
import { BRAND_LOGO } from '@/configs/image-paths';
import AppImage from '@/core/components/app-image/AppImage';
import { AuthPageWrapper } from './styled-components';

const withAuthCard = (OriginalComponent: () => React.JSX.Element) => {
  function NewComponent() {
    return (
      <AuthPageWrapper>
        <Card className='auth-card'>
          <Box sx={{ textAlign: 'center', mb: 4, mt: -4 }} className='mobile-logo'>
            <AppImage
              loader={({ src }) => src}
              src={BRAND_LOGO}
              alt='Company Logo'
              width={300}
              height={100}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <OriginalComponent />
        </Card>
      </AuthPageWrapper>
    );
  }

  return NewComponent;
};

export default withAuthCard;
