'use client';

import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { SxProps, useTheme } from '@mui/material/styles';
import Icon from '@/core/components/icon';
import { ClickableTooltip, MaterialUITooltipProps } from './types';
import { InfoTip } from '.';

type MuiClickableTooltipProps = ClickableTooltip & {
  trigger?: 'click' | 'hover';
  iconButtonSxProps?: SxProps;
  infoTipProps?: Omit<MaterialUITooltipProps, 'title' | 'children'>;
};

const MuiClickableTooltip: React.FC<MuiClickableTooltipProps> = ({
  content,
  trigger = 'hover',
  iconButtonSxProps,
  infoTipProps,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleTooltipToggle = (state?: boolean) =>
    setOpen((prev) => (state !== undefined ? state : !prev));

  const tooltipProps =
    trigger === 'hover'
      ? {
          onMouseEnter: () => handleTooltipToggle(true),
          onMouseLeave: () => handleTooltipToggle(false),
        }
      : {
          onClick: () => handleTooltipToggle(),
        };

  return (
    <InfoTip
      arrow
      placement='left-end'
      open={open}
      title={content}
      onClose={() => handleTooltipToggle(false)}
      onOpen={() => handleTooltipToggle(true)}
      disableHoverListener={trigger === 'click'}
      {...infoTipProps}
    >
      <IconButton {...tooltipProps} sx={{ ...iconButtonSxProps }}>
        <Icon icon='material-symbols:info-outline' color={theme.palette.primary.main} />
      </IconButton>
    </InfoTip>
  );
};

export default MuiClickableTooltip;
