'use client';

import React, { FC, memo, useCallback, useState } from 'react';
import { Avatar, Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import { AVATAR } from '@/configs/image-paths';
import Icon from '@/core/components/icon';
import { imgPath } from '@/utils/file-utils';
import { getOrDefault } from '@/utils/string-utils';
import ProfileChip from './ProfileChip';
import { Container } from './styled-components';
import { EmployeeProfileCardProps } from './types';

const EmployeeProfileCard: FC<EmployeeProfileCardProps> = ({
  employeeData,
  employeeEmail,
  employeeName,
  employeeProfileUrl,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const profileImageSrc = imgPath(employeeProfileUrl);

  const handleImgError = useCallback(() => setImgError(true), []);

  return (
    <Container sx={{ padding: isExpanded ? 2 : 1.5 }}>
      <Box
        className='img-wrapper'
        sx={{
          height: isExpanded ? 110 : 60,
          width: isExpanded ? 110 : 60,
          transition: 'all 0.3s ease',
        }}
      >
        <Avatar
          alt={employeeName}
          src={imgError || !profileImageSrc ? AVATAR : profileImageSrc}
          onError={handleImgError}
          sx={{ borderRadius: 2, width: '100%', height: '100%' }}
        />
      </Box>
      <Box className='details-wrapper' sx={{ gap: isExpanded ? 1 : 0.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box className='text-wrapper'>
            <Typography variant={isExpanded ? 'h6' : 'body1'} fontWeight={600} lineHeight={1.2}>
              {getOrDefault(employeeName)}
            </Typography>
            <Typography variant={isExpanded ? 'body1' : 'body2'} color='textSecondary'>
              {getOrDefault(employeeEmail)}
            </Typography>
          </Box>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            sx={{ alignSelf: 'flex-start', mt: -0.5 }}
          >
            <Icon icon={isExpanded ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} />
          </IconButton>
        </Box>

        <Collapse in={isExpanded} timeout='auto'>
          <Box className='rating-wrapper' sx={{ mt: 1 }}>
            {employeeData?.map((data) => (
              <ProfileChip key={data.id} {...data} />
            ))}
          </Box>
        </Collapse>

        {!isExpanded && (
          <Button
            variant='text'
            size='small'
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            sx={{
              textTransform: 'none',
              padding: 0,
              minWidth: 'auto',
              alignSelf: 'flex-start',
              fontSize: '0.75rem',
              mt: 0.5,
            }}
          >
            View More
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default memo(EmployeeProfileCard);
