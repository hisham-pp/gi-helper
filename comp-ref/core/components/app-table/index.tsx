import React, { memo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { TableBodyContent, TableHeader } from './Components';
import { StyledTableContainer, StyledTableHead } from './styled-components';
import { AppTableProps } from './types';

const AppTable: React.FC<AppTableProps> = ({
  id,
  headers,
  rows,
  loading,
  stickyHeader = false,
  tableContainerProps = {},
  onRowClick,
  enableInlineFilters = false,
  filterValues = {},
  onFilterChange,
  sortOptions,
}) => {
  return (
    <StyledTableContainer {...tableContainerProps} id={id}>
      <Table stickyHeader={stickyHeader} id={`${id}-table`}>
        <StyledTableHead>
          <TableHeader
            headers={headers}
            id={`${id}-header`}
            enableInlineFilters={enableInlineFilters}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            sortOptions={sortOptions}
          />
        </StyledTableHead>
        <TableBody>
          <TableBodyContent
            headers={headers}
            rows={rows}
            loading={loading}
            onRowClick={onRowClick}
            id={`${id}-body`}
          />
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default memo(AppTable);
