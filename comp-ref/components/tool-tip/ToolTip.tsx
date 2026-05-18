import React from 'react';
import MaterialUITooltip from '@mui/material/Tooltip';
import { MaterialUITooltipProps } from './types';

const Tooltip: React.FC<MaterialUITooltipProps> = ({ title, children, arrow = true, ...props }) => (
  <MaterialUITooltip title={title} arrow={arrow} {...props}>
    <div>{children}</div>
  </MaterialUITooltip>
);

export default Tooltip;
