import { BoxProps } from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import { TabsProps } from '@mui/material/Tabs';

export type TabPanelProps = {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
};

type TabData = {
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  value?: string;
  permissionKey?: string;
  id?: string;
};

export type AppTabProps = {
  tabs: TabData[];
  disabled?: boolean;
  panelContainerProps?: BoxProps;
  wrapperProps?: BoxProps;
  orientation?: TabsProps['orientation'];
  variant?: 'standard' | 'outlined';
  tabStoreKey?: string;
  valueUpdated?: boolean;
  excludeFromAutoSwitch?: number[];
  activeTab?: string | number;
  onTabChange?: (tabLabel: number) => void;
  tabStyle?: SxProps<Theme>;
};
