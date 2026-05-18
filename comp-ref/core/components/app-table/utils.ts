import { TableCellProps } from '@mui/material';

/** Creates cellProps with minWidth and whiteSpace: 'nowrap' for table headers */
export const headerCellProps = (minWidth: number): { cellProps: TableCellProps } => ({
  cellProps: { sx: { minWidth, whiteSpace: 'nowrap' } },
});
