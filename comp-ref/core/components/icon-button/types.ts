import { IconButtonProps } from '@mui/material/IconButton';

export type Props = IconButtonProps & {
  toolTip?: string;
  iconSize?: number;
};

export type WrapperProps = {
  toolTip?: string;
  children: React.JSX.Element;
};
