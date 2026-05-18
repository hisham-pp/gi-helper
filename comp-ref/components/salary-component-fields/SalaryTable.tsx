import React from 'react';
import { TableBody } from '@mui/material';
import { StyledTable, StyledTableRow } from './styled-components';
import { SalaryTableProps } from './types';

const SalaryTable: React.FC<SalaryTableProps> = ({ children }) => (
  <StyledTable>
    <TableBody>
      <StyledTableRow sx={{ display: 'flex' }}>{children}</StyledTableRow>
    </TableBody>
  </StyledTable>
);

export default SalaryTable;
