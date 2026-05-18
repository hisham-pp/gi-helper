import { SxProps } from '@mui/material';
import { StatusEnumeration } from '@/enums/status';

export type MasterChipProps = {
  isActive?: boolean;
};

export type StatusChip = {
  status?: StatusEnumeration;
  chipStyle?: SxProps;
  label?: string;
};

export type StatusLabelProps = {
  status?: StatusEnumeration;
  fontSize?: number | string;
  label?: string;
};
