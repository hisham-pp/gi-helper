import { ReactNode } from 'react';
import { TableCellProps } from '@mui/material/TableCell';
import { FormField } from '../form-helpers/types';

type CommonCellProps = {
  key: string;
  size?: FormField['size'];
  align?: TableCellProps['align'];
};

export type AccordionTableHeader = CommonCellProps & {
  header: ReactNode;
};

export type AccordionTableCell = CommonCellProps & {
  value: ReactNode;
};

export type AccordionTableRow = {
  title: ReactNode;
  subItems?: AccordionTableCell[][];
};

export type AccordionTableProps = {
  headers: AccordionTableHeader[];
  rows: AccordionTableRow[];
  loading?: boolean;
};
