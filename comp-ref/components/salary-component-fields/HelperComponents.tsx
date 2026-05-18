import React from 'react';
import {
  InputAdornment,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Translations from '@/core/components/translations';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { calculateCTC } from '@/utils/calculator';
import { roundToDecimalPlaces } from '@/utils/numerical-utils';
import {
  ComponentLabel,
  CustomTextField,
  FixedAmountLabel,
  StyledTable,
  StyledTableCell,
  StyledTableCellRight,
  StyledTableRow,
  StyledTypography,
} from './styled-components';
import {
  DeductionRowProps,
  PercentageBoxProps,
  ReusableHeaderProps,
  TableHeaderProps,
} from './types';

export const TextFieldWithEndLabel = ({ value, endAdornmentLabel }: PercentageBoxProps) => (
  <CustomTextField
    variant='outlined'
    size='small'
    disabled
    value={value}
    sx={{
      width: 'fit-content',
      '& .MuiInputBase-input': { width: '50px' },
    }}
    InputProps={{
      endAdornment: (
        <InputAdornment position='end'>
          <Typography sx={{ fontSize: '12px !important', whiteSpace: 'nowrap' }}>
            {endAdornmentLabel}
          </Typography>
        </InputAdornment>
      ),
    }}
  />
);

export const TableHeader: React.FC<TableHeaderProps> = ({ columns }) => (
  <StyledTable>
    <TableHead>
      <TableRow className='table-row'>
        {columns.map((column, index) => (
          <TableCell key={index} className={column.className || ''} sx={{ flex: 1 }}>
            <Translations text={column.label} />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  </StyledTable>
);

export const ReusableHeader: React.FC<ReusableHeaderProps> = ({ title, titleStyles }) => {
  return (
    <StyledTypography titlestyles={titleStyles}>
      <Translations text={title} />
    </StyledTypography>
  );
};

export const DeductionRow: React.FC<DeductionRowProps> = ({
  label,
  isViewMode,
  type,
  value = 0,
}) => {
  const { formateCurrency } = useCurrencyFormatter();

  const getValue = (value: number | string) => {
    return isViewMode ? formateCurrency(value) : 'SYSTEM CALCULATED';
  };

  return (
    <StyledTable>
      <TableBody>
        <StyledTableRow sx={{ display: 'flex' }}>
          <StyledTableCell sx={{ flex: 1 }}>
            <ComponentLabel>
              <Translations text={label} />
            </ComponentLabel>
          </StyledTableCell>
          <StyledTableCellRight>
            <FixedAmountLabel>{type}</FixedAmountLabel>
          </StyledTableCellRight>
          <StyledTableCellRight sx={isViewMode ? { textAlign: 'center', ml: '3rem' } : {}}>
            {getValue(calculateCTC(value ?? 0))}
          </StyledTableCellRight>
          <StyledTableCellRight>
            {getValue(calculateCTC(roundToDecimalPlaces(value ?? 0)))}
          </StyledTableCellRight>
        </StyledTableRow>
      </TableBody>
    </StyledTable>
  );
};

export const otherAllowanceInfoText = (
  <span style={{ fontSize: '14px' }}>
    Any additional or residual amounts after adjusting salary components will be displayed in ‘Other
    Allowance’ though negative values cannot be saved.
  </span>
);
