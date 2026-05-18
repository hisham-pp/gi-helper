import { PaginationProps as MuiPaginationProps } from '@mui/material/Pagination';

export type PaginationProps = {
  totalCount?: number;
  page?: number;
  bottomGutter?: number;
  position?: 'first' | 'last';
  variant?: MuiPaginationProps['variant'];
  shape?: MuiPaginationProps['shape'];
  onChange?: (page: number) => void;
};
