'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ProcessFlowCardContainer } from './styled-components';
import Props from './type';

const ProcessFlowCard: React.FC<Props> = ({
  initialView = true,
  heading,
  renderAfterHeading,
  renderInfoIcon,
  initialViewProps,
  content,
}) => {
  const [isInitialView, setIsInitialView] = useState(initialView);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (initialViewProps?.onButtonClick) {
        await initialViewProps.onButtonClick(e);
      }
      setIsInitialView(false);
    },
    [initialViewProps],
  );

  useEffect(() => {
    setIsInitialView(initialView);
  }, [initialView]);

  const renderInitialView = useMemo(
    () => (
      <Stack className='initial-view'>
        <Typography variant='subtitle2'>{initialViewProps?.infoMessage}</Typography>
        <Button variant='contained' disableElevation onClick={handleClick}>
          {initialViewProps?.buttonLabel}
        </Button>
      </Stack>
    ),
    [initialViewProps, handleClick],
  );

  return (
    <ProcessFlowCardContainer>
      <Box className='header-wrapper'>
        <Box className='info-wrapper'>
          <Typography variant='subtitle2' className='heading'>
            {heading}
          </Typography>
          <>{renderInfoIcon}</>
        </Box>
        <>{renderAfterHeading}</>
      </Box>
      <Box>
        <Box className='initial-view-wrapper' width='100%'>
          {isInitialView ? renderInitialView : content}
        </Box>
      </Box>
    </ProcessFlowCardContainer>
  );
};

export default ProcessFlowCard;
