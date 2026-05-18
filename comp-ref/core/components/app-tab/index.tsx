'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { EmployeeTabPanelIndexStoreKey } from '@/configs/employee-table';
import { usePermission } from '@/hooks/use-permission';
import Translations from '../translations';
import { HorizontalWrapper } from './styled-components';
import TabPanel from './TabPanel';
import { AppTabProps } from './types';

function a11yProps(index: number) {
  return {
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function AppTab({
  tabs,
  disabled = false,
  orientation = 'vertical',
  panelContainerProps = {},
  wrapperProps = {},
  variant = 'standard',
  tabStoreKey,
  valueUpdated,
  excludeFromAutoSwitch = [],
  activeTab,
  onTabChange,
}: AppTabProps) {
  const { className = '', ...rest } = wrapperProps;

  const theme = useTheme();
  const { havePermission } = usePermission();

  const [value, setValue] = useState(0);

  const availableTabs = useMemo(
    () => tabs?.filter((tab) => (tab?.permissionKey ? havePermission(tab?.permissionKey) : true)),
    [havePermission, tabs],
  );

  useEffect(() => {
    if (typeof activeTab === 'number' && activeTab !== value) {
      setValue(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
      if (tabStoreKey) localStorage.setItem(tabStoreKey, newValue.toString());
      if (onTabChange) onTabChange(newValue);
    },
    [tabStoreKey, onTabChange],
  );

  const prevValueUpdated = useRef(valueUpdated);
  useEffect(() => {
    // Only advance tab when valueUpdated transitions from false to true
    if (valueUpdated && !prevValueUpdated.current && EmployeeTabPanelIndexStoreKey) {
      setValue((prev) => {
        if (excludeFromAutoSwitch.includes(prev)) return prev;

        const nextTab = prev === availableTabs.length - 1 ? 0 : prev + 1;
        localStorage.setItem(EmployeeTabPanelIndexStoreKey, nextTab.toString());
        return nextTab;
      });
    }
    prevValueUpdated.current = valueUpdated;
  }, [valueUpdated, availableTabs.length, excludeFromAutoSwitch]);

  useEffect(() => {
    if (tabStoreKey) {
      const storedValue = localStorage.getItem(tabStoreKey);
      if (storedValue) {
        setValue(parseInt(storedValue));
      }
    }
  }, [tabStoreKey]);

  return (
    <HorizontalWrapper className={`${orientation + className} ${variant}`} {...rest}>
      <Tabs
        variant='scrollable'
        indicatorColor='secondary'
        textColor='inherit'
        aria-label='full width tabs'
        orientation={orientation}
        className={`${orientation}-tabs`}
        value={value}
        onChange={handleTabChange}
        id='app-tab'
      >
        {availableTabs?.map((tab, index) => (
          <Tab
            key={index}
            label={typeof tab?.label === 'string' ? <Translations text={tab?.label} /> : tab?.label}
            disabled={disabled || tab?.disabled}
            id={tab?.id}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>
      <Box {...panelContainerProps} className={`${orientation}-panels`}>
        {availableTabs?.map((tab, index) => (
          <TabPanel key={index} value={value} index={index} dir={theme?.direction}>
            {tab?.content}
          </TabPanel>
        ))}
      </Box>
    </HorizontalWrapper>
  );
}
