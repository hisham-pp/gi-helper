import { GridProps } from '@mui/material/Grid';

export type AppModalProps = {
  open: boolean;
  onClose: () => void;
  containerProps?: GridProps;
  children?: React.JSX.Element;
};
