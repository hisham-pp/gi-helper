import React, { memo } from 'react';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import AppButton from '@/core/components/button';
import Icon from '@/core/components/icon';
import IconButton from '@/core/components/icon-button';
import ShapeLoader from '@/core/components/loaders/Shape';
import Translations from '@/core/components/translations';
import { Content, DrawerFooter, DrawerHeader, StyledDrawer } from './styled-components';
import { DrawerWithControlsProps } from './types';

const boxProps = {
  sx: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
  },
};

const DrawerWithControls: React.FC<DrawerWithControlsProps> = ({
  open,
  onClose,
  children,
  title,
  subHeader,
  onSave,
  showFooter = true,
  loading = false,
  footerContainerProps,
  paperProps = {},
  outlineButtonProps = {},
  filledButtonProps = {},
  contentProps = {},
  transitionDuration,
}) => {
  const outlineProps = {
    label: 'Cancel',
    onClick: onClose,
    fullWidth: true,
    isShow: true,
    ...outlineButtonProps,
  };

  const filledProps = {
    label: 'Save',
    fullWidth: true,
    isShow: true,
    ...filledButtonProps,
  };

  const { sx: paperSx, ...paperRest } = paperProps || {};
  const { isShow: outlineIsShow, ...outlineButtonPropsRest } = outlineProps;
  const { isShow: filledIsShow, ...filledButtonPropsRest } = filledProps;

  return (
    <StyledDrawer
      anchor={'right'}
      component='form'
      open={open}
      onClose={onClose}
      onSubmit={onSave}
      {...(transitionDuration != null && { transitionDuration })}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 550 },
            ...paperSx,
          },
          ...paperRest,
        },
      }}
    >
      <DrawerHeader>
        <Box>
          <Typography className='header'>
            {typeof title === 'string' ? <Translations text={title} /> : title}
          </Typography>
          <Typography className='sub-header'>{subHeader}</Typography>
        </Box>
        <IconButton className='close' onClick={onClose} toolTip='Close' disabled={loading}>
          <Icon icon='zondicons:close' />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Content {...contentProps}>
        {loading ? <ShapeLoader boxProps={boxProps} /> : <>{children}</>}
      </Content>
      {showFooter && (
        <DrawerFooter {...footerContainerProps}>
          {outlineIsShow && (
            <AppButton variant='outlined' {...outlineButtonPropsRest} id='cancel'>
              <Translations text={outlineProps.label} />
            </AppButton>
          )}
          {filledIsShow && (
            <AppButton type='submit' {...filledButtonPropsRest} id='save'>
              <Translations text={filledProps.label} />
            </AppButton>
          )}
        </DrawerFooter>
      )}
    </StyledDrawer>
  );
};

export default memo(DrawerWithControls);
