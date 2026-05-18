'use client';

import React, { memo, useCallback, useContext } from 'react';
import { Box, Collapse } from '@mui/material';
import { SettingsContext } from '@/context/SettingsContext';
import CanViewNavGroup from '@/core/components/auth/CanViewNavGroup';
import type { NavGroup as NavGroupType } from '../../../types';
import NavItem from '../NavItem';

type Props = {
  group?: NavGroupType;
  navCollapsed?: boolean;
};

const NavGroup: React.FC<Props> = ({ group, navCollapsed }) => {
  const { expandedNavGroups, toggleNavGroup, setOnlyExpandedGroup } = useContext(SettingsContext);

  const isExpanded = group?.id ? expandedNavGroups.includes(group.id) : false;

  const handleClick = useCallback(
    (grp?: NavGroupType) => {
      if (grp?.id) {
        toggleNavGroup(grp.id);
      }
    },
    [toggleNavGroup],
  );

  const handleGroupItemClick = useCallback(() => {
    if (group?.id) {
      setOnlyExpandedGroup(group.id);
    }
  }, [group?.id, setOnlyExpandedGroup]);

  return (
    <CanViewNavGroup navGroup={group}>
      <Box width='100%'>
        <NavItem
          isParent
          item={group}
          isDropDownOpen={isExpanded}
          navCollapsed={navCollapsed}
          onClick={handleClick}
        />

        <Collapse
          in={isExpanded}
          timeout='auto'
          unmountOnExit
          sx={{
            pl: navCollapsed ? 0 : 4,
            overflow: 'hidden',
          }}
        >
          {group?.children?.map((item, i) => (
            <NavItem
              key={`vertical-group-${i}`}
              item={item}
              isGroupItem
              siblingPaths={group?.children
                ?.filter((child) => child.path && child.path !== item.path)
                .map((child) => child.path as string)}
              navCollapsed={navCollapsed}
              onClick={handleGroupItemClick}
            />
          ))}
        </Collapse>
      </Box>
    </CanViewNavGroup>
  );
};

export default memo(NavGroup);
