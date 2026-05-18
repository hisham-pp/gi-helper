import { Fragment, memo, MouseEvent, useState } from 'react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import AppButton from '../button';
import Icon from '../icon';
import MenuOptions from './MenuOptions';
import { AppMenuProps } from './type';

const AppMenu: React.FC<AppMenuProps> = ({
  iconButtonProps,
  iconProps,
  menuProps,
  icon,
  renderMenuIcon,
  options,
  sx,
  isShowButton = false,
  onClick,
  inProgress,
}) => {
  const { palette } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuDirection = 'left';

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderMenu = () => {
    if (isShowButton) {
      return (
        <AppButton sx={{ alignItems: 'center', gap: 3 }} loading={inProgress}>
          Export
          <Icon
            icon={anchorEl ? 'lsicon:up-filled' : 'lsicon:down-filled'}
            color={palette.common.white}
          />
        </AppButton>
      );
    }
    if (!renderMenuIcon) {
      return (
        <IconButton {...iconButtonProps}>
          {icon ? icon : <Icon icon='bx:dots-vertical-rounded' {...iconProps} />}
        </IconButton>
      );
    }

    return renderMenuIcon;
  };

  return (
    <Fragment>
      <Box aria-haspopup='true' onClick={handleClick}>
        {renderMenu()}
      </Box>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        anchorOrigin={{ vertical: 'bottom', horizontal: menuDirection }}
        transformOrigin={{ vertical: 'top', horizontal: menuDirection }}
        {...menuProps}
        {...(sx && {
          sx,
        })}
      >
        <MenuOptions options={options} dropdownClose={handleClose} onClick={onClick} />
      </Menu>
    </Fragment>
  );
};

export default memo(AppMenu);
