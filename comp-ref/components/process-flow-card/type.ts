import { ReactNode } from 'react';
import { AppMenuProps, OptionMenuItemType } from '@/core/components/app-menu/type';

type InitialView = {
  infoMessage?: string;
  buttonLabel?: string;
  onButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type Props = {
  initialView?: boolean;
  heading: string;
  renderAfterHeading?: React.JSX.Element;
  renderInfoIcon?: React.JSX.Element;
  content?: ReactNode;
  initialViewProps?: InitialView;
  isContentInFullWidth?: boolean;
};

export type FlowControlButtonProps = {
  onRemoveClick: () => void;
  menuOptions: OptionMenuItemType[];
  onMenuClick: AppMenuProps['onClick'];
};

export default Props;
