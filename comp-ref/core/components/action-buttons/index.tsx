import { memo } from 'react';
import { useTheme } from '@mui/material';
import icons from '@/configs/icons';
import Icon from '@/core/components/icon';
import IconButton from '@/core/components/icon-button';
import { usePermission } from '@/hooks/use-permission';
import { getIconColor } from '@/utils/color-utils';
import { Props } from './types';

icons.loadIcons([
  'hugeicons:view',
  'material-symbols:edit-sharp',
  'fluent:delete-12-filled',
  'mdi:tick',
  'mdi:link',
  'material-symbols:pending',
  'material-symbols:content-copy',
  'mdi:send',
  'mdi:cancel',
  'mdi:chart-timeline-variant',
  'mdi:file-pdf-box',
]);

const properties = {
  view: { icon: 'hugeicons:view', color: 'primary', toolTip: 'View' },
  edit: { icon: 'material-symbols:edit-sharp', color: 'primary', toolTip: 'Edit' },
  delete: { icon: 'fluent:delete-12-filled', color: 'error', toolTip: 'Delete' },
  save: { icon: 'mdi:tick', color: 'primary', toolTip: 'Save' },
  link: { icon: 'mdi:link', color: 'primary', toolTip: 'Copy Link' },
  options: { icon: 'material-symbols:pending', color: 'primary', toolTip: 'options' },
  convert: {
    icon: 'teenyicons:clipboard-tick-outline',
    color: 'primary',
    toolTip: 'Convert To Job Post',
  },
  copy: { icon: 'material-symbols:content-copy', color: 'primary', toolTip: 'Copy' },
  send: { icon: 'mdi:send', color: 'success', toolTip: 'Send' },
  cancel: { icon: 'mdi:cancel', color: 'error', toolTip: 'Cancel' },
  track: { icon: 'mdi:chart-timeline-variant', color: 'info', toolTip: 'Track Progress' },
  pdf: { icon: 'mdi:file-pdf-box', color: 'primary', toolTip: 'Generate PDF' },
};

const ActionButton: React.FC<Props> = ({
  onClick,
  actionFor = 'view',
  id,
  disabled,
  permissionKeys,
}) => {
  const theme = useTheme();
  const { havePermission } = usePermission();

  const { toolTip, icon, color } = properties[actionFor];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick && id !== undefined) onClick(id);
  };

  const iconColor = getIconColor(color, theme, disabled as boolean);

  const hasPermission = permissionKeys?.every((key) => havePermission(key)) ?? true;

  if (!hasPermission) {
    return null;
  }

  return (
    <IconButton
      toolTip={toolTip}
      onClick={handleClick}
      disabled={disabled}
      sx={{ py: 0, px: 0.5 }}
      iconSize={18}
      disableRipple
      id={id?.toString()}
    >
      <Icon icon={icon} color={iconColor} fontSize={18} />
    </IconButton>
  );
};

export default memo(ActionButton);
