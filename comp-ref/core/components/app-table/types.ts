import { ReactNode } from 'react';
import { TableCellProps } from '@mui/material/TableCell';
import { TableContainerProps } from '@mui/material/TableContainer';
import { SortOrder } from '@/enums/common';
import { Any } from '@/types';

/**
 * Filter types supported in table headers
 */
export enum FilterType {
  TEXT = 'text',
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi_select',
  DATE_RANGE = 'date_range',
}

/**
 * Filter value can be string, number, array, or date range
 */
export type FilterValue =
  | string
  | number
  | string[]
  | { from: Date | null; to: Date | null }
  | null;

/**
 * Configuration for inline header filters
 */
export type FilterConfig = {
  type: FilterType;
  options?: ({
    id?: string | number;
    name?: string;
    label?: string;
    value?: string | number;
  } | null)[];
  placeholder?: string;
  isMulti?: boolean;
  action?: Any; // Redux action to fetch options dynamically
};

export type HeaderProperty = {
  columnKey: string;
  header: ReactNode;
  cellProps?: TableCellProps;
  // Legacy support for 'key' property
  key?: string;
  // Optional filter configuration for inline filtering
  filterConfig?: FilterConfig;
  sortable?: boolean;
};

export type HeaderCellProps = {
  header: ReactNode;
  cellProps?: TableCellProps;
};

/**
 * Props for FilterableHeaderCell component
 */
export type FilterableHeaderCellProps = {
  header: ReactNode;
  columnKey: string;
  cellProps?: TableCellProps;
  filterConfig?: FilterConfig;
  currentFilterValue?: FilterValue;
  onFilterChange?: (columnKey: string, value: FilterValue) => void;
};

export type Header = HeaderProperty & {
  subHeaders?: Header[];
};

export type Cell = {
  value: React.ReactNode;
  cellProps?: TableCellProps;
};

export type SubCell = {
  [subKey: string]: Cell;
};

export type Row = {
  [key: string]: Cell | SubCell;
};

export type SortOption = {
  sortKey: string;
  order: SortOrder;
  onChange: (key: string, order: SortOrder) => void;
};

export type AppTableProps = {
  id?: string;
  headers: Header[];
  rows: Row[];
  loading?: boolean;
  stickyHeader?: boolean;
  tableContainerProps?: TableContainerProps;
  onRowClick?: (row: Row) => void;
  // Inline filtering support
  enableInlineFilters?: boolean;
  filterValues?: Record<string, FilterValue>;
  onFilterChange?: (columnKey: string, value: FilterValue) => void;
  sortOptions?: SortOption;
};

export type TableHeaderProps = {
  headers: Header[];
  id?: string;
  // Inline filtering support
  enableInlineFilters?: boolean;
  filterValues?: Record<string, FilterValue>;
  onFilterChange?: (columnKey: string, value: FilterValue) => void;
  sortOptions?: SortOption;
};

export type TableBodyContentProps = {
  loading?: boolean;
  headers: Header[];
  sx?: TableCellProps['sx'];
  rows: Row[];
  onRowClick?: (row: Row) => void;
  id?: string;
};

export type CellProps = {
  align?: 'left' | 'center' | 'right';
  sx?: TableCellProps['sx'];
  style?: TableCellProps['style'];
  onClick?: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
};
