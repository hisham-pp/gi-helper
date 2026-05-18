import Link from 'next/link';
import React, { Fragment, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiMenuItem from '@mui/material/MenuItem';
import PermissionWrapper from '@/components/PermissionWrapper';
import Translations from '../translations';
import { MenuItemProps, MenuOptionProps, OptionMenuItemType, TextOnlyMenuProps } from './type';

const styles = {
  py: 2,
  px: 4,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  color: 'text.secondary',
  textDecoration: 'none',

  '& svg': {
    mr: 2,
    fontSize: '1.25rem',
    color: 'text.secondary',
  },
};

const MenuItemWrapper = ({
  children,
  option,
}: {
  children: ReactNode;
  option: OptionMenuItemType;
}) => {
  const hasHref =
    option?.href && (typeof option.href === 'string' ? option.href.trim() !== '' : true);

  return (
    <Box
      component={hasHref ? Link : Box}
      {...(hasHref && { href: option.href })}
      sx={{ ...styles }}
    >
      {children}
    </Box>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ option, permissionKeys, handleClose, onClick }) => {
  return (
    <PermissionWrapper permissionKeys={permissionKeys}>
      <MuiMenuItem
        sx={{ p: 0 }}
        {...option.menuItemProps}
        onClick={(e) => {
          handleClose();
          onClick && onClick(option);
          option.menuItemProps && option.menuItemProps.onClick
            ? option.menuItemProps.onClick(e)
            : null;
        }}
      >
        <MenuItemWrapper option={option}>
          {option.icon ?? null}
          <Translations text={String(option.text)} />
        </MenuItemWrapper>
      </MuiMenuItem>
    </PermissionWrapper>
  );
};

const TextOnlyMenu: React.FC<TextOnlyMenuProps> = ({ text, handleClose }) => {
  return (
    <MuiMenuItem onClick={handleClose}>
      <Translations text={text} />
    </MuiMenuItem>
  );
};

const MenuOptions: React.FC<MenuOptionProps> = ({ options, dropdownClose, onClick }) => {
  return (
    <Fragment>
      {options?.map((option, i) => {
        if (typeof option === 'string')
          return <TextOnlyMenu key={`text-only-${i}`} text={option} handleClose={dropdownClose} />;
        else if ('divider' in option)
          return option.divider && <Divider key={`divider-${i}`} {...option.dividerProps} />;
        else if ('content' in option) {
          const ContentWrapper = option?.closeOnClick ? Box : Fragment;
          const content =
            typeof option.content === 'function' ? option.content(dropdownClose) : option.content;
          return (
            <ContentWrapper
              key={`content-${i}`}
              {...(option?.closeOnClick && { onClick: dropdownClose })}
            >
              {content}
            </ContentWrapper>
          );
        } else
          return (
            <MenuItem
              key={`options-${i}`}
              option={option}
              handleClose={dropdownClose}
              onClick={onClick}
              permissionKeys={option?.permissionKeys}
            />
          );
      })}
    </Fragment>
  );
};

export default MenuOptions;
