import React, { FC, memo } from 'react';
import { Grid, GridProps } from '@mui/material';
import ShapeLoader from '@/core/components/loaders/Shape';

type Props = {
  loading?: boolean;
  children: React.ReactNode;
  containerProps?: GridProps;
  containerHeight?: number | string;
};

const ConditionalWrapper: FC<Props> = ({
  loading,
  children,
  containerProps = {},
  containerHeight = '100vh',
}) => {
  const { sx, ...rest } = containerProps;

  if (loading) {
    return (
      <Grid
        container
        height={containerHeight}
        sx={{ alignItems: 'center', justifyContent: 'center', ...sx }}
        {...rest}
      >
        <ShapeLoader />
      </Grid>
    );
  }

  return <>{children}</>;
};

export default memo(ConditionalWrapper);
