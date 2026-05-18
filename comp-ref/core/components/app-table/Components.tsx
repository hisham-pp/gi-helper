import { Fragment, useCallback } from 'react';
import { alpha, Box, SxProps, Theme, useTheme } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import { SortOrder } from '@/enums/common';
import hexToRGBA from '@/utils/hex-to-rgba';
import ShapeLoader from '../loaders/Shape';
import Translations from '../translations';
import { FilterableHeaderCell } from './FilterableHeaderCell';
import SortIcon from './SortIcon';
import { SortableHeaderWrapper, StyledTableRow } from './styled-components';
import {
  Cell,
  Header,
  HeaderCellProps,
  SubCell,
  TableBodyContentProps,
  TableHeaderProps,
} from './types';

// Utility function to get effective column key for backward compatibility
const getEffectiveColumnKey = (header: Header, fallbackIndex: number): string => {
  // Type for backward compatibility with legacy 'key' property
  const legacyHeader = header as Header & { key?: string };
  return header.columnKey || legacyHeader.key || `header-${fallbackIndex}`;
};

export const tableRowStyle: SxProps<Theme> = ({ palette: { primary } }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: hexToRGBA(primary.main, 0.1),
  },
  '&:active ': {
    transform: 'translateY(-1.5px)',
    transition: 'all 0.2s ease-in-out',
  },
});

export const HeaderCell: React.FC<HeaderCellProps> = ({ cellProps = {}, header }) => {
  const { sx, ...rest } = cellProps;
  return (
    <TableCell component='th' sx={{ whiteSpace: 'nowrap', ...sx }} {...rest}>
      <Box sx={{ textTransform: 'uppercase' }}>
        {typeof header === 'string' ? <Translations text={header} /> : header}
      </Box>
    </TableCell>
  );
};

export const SubHeaderCell = ({ header }: { header: Header }) => {
  const theme = useTheme();
  const dimWhiteColor = alpha(theme.palette.common.white, 0.4);

  const { cellProps = {} } = header;
  const { style, sx, ...rest } = cellProps;

  return (
    <TableCell
      style={{ padding: 0, ...style }}
      sx={{ ...sx }}
      colSpan={header?.subHeaders?.length}
      {...rest}
    >
      <StyledTableRow>
        <TableCell
          colSpan={header?.subHeaders?.length}
          align='center'
          style={{ paddingTop: 5, border: `1px solid ${dimWhiteColor}`, paddingBottom: 5 }}
        >
          {typeof header.header === 'string' ? (
            <Translations text={header.header} />
          ) : (
            header.header
          )}
        </TableCell>
      </StyledTableRow>

      {header?.subHeaders?.map((subHeader, subIndex) => {
        const { cellProps = {} } = subHeader;
        const { style, sx, ...rest } = cellProps;
        const effectiveSubKey = getEffectiveColumnKey(subHeader, subIndex);
        const effectiveHeaderKey = getEffectiveColumnKey(header, 0);
        return (
          <TableCell
            key={`sub-${effectiveHeaderKey}-${effectiveSubKey}`}
            role='row'
            style={{
              border: `1px solid ${dimWhiteColor}`,
              paddingTop: 5,
              paddingBottom: 5,
              ...style,
            }}
            sx={{ ...sx }}
            {...rest}
          >
            {typeof subHeader.header === 'string' ? (
              <Translations text={subHeader.header} />
            ) : (
              subHeader.header
            )}
          </TableCell>
        );
      })}
    </TableCell>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  headers,
  id,
  enableInlineFilters = false,
  filterValues = {},
  onFilterChange,
  sortOptions,
}) => {
  const theme = useTheme();
  const dimWhiteColor = alpha(theme.palette.common.white, 0.4);

  const handleSortClick = useCallback(
    (key: string) => {
      if (!sortOptions) return;
      const { sortKey, order: sortOrder, onChange: onSortChange } = sortOptions;
      if (!onSortChange) return;

      if (sortKey === key) {
        if (sortOrder === SortOrder.ASC) {
          onSortChange(key, SortOrder.DESC);
        } else {
          // Deselect: clear sort to return to default order
          onSortChange('', SortOrder.ASC);
        }
      } else {
        onSortChange(key, SortOrder.ASC);
      }
    },
    [sortOptions],
  );

  // Check if any header has subHeaders to determine if we need multi-level rendering
  const hasSubHeaders = headers.some((header) => header.subHeaders && header.subHeaders.length > 0);

  if (!hasSubHeaders) {
    // Single-level header rendering (existing logic)
    return (
      <StyledTableRow id={`${id}-header-row`}>
        {headers.map((header, index) => {
          const effectiveKey = getEffectiveColumnKey(header, index);
          const isSortable = !!header.sortable;
          const isActive = sortOptions?.sortKey === effectiveKey;

          if (enableInlineFilters && header.filterConfig) {
            return (
              <FilterableHeaderCell
                key={`${effectiveKey}-${index}`}
                header={header.header}
                columnKey={effectiveKey}
                cellProps={header.cellProps}
                filterConfig={header.filterConfig}
                currentFilterValue={filterValues[effectiveKey]}
                onFilterChange={onFilterChange}
              />
            );
          }

          const { cellProps = {} } = header;
          const { align, sx: headerSx, ...restCellProps } = cellProps;

          return (
            <TableCell
              key={`${effectiveKey}-${index}`}
              align={align}
              sx={{ whiteSpace: 'nowrap', ...headerSx }}
              {...restCellProps}
            >
              <SortableHeaderWrapper
                isSortable={isSortable}
                align={align}
                onClick={isSortable ? () => handleSortClick(effectiveKey) : undefined}
              >
                <Box sx={{ textTransform: 'uppercase' }}>
                  {typeof header.header === 'string' ? (
                    <Translations text={header.header} />
                  ) : (
                    header.header
                  )}
                </Box>

                {isSortable && <SortIcon isActive={isActive} order={sortOptions?.order} />}
              </SortableHeaderWrapper>
            </TableCell>
          );
        })}
      </StyledTableRow>
    );
  }

  // Multi-level header rendering
  return (
    <>
      {/* First row: Main headers */}
      <StyledTableRow id={`${id}-header-row`}>
        {headers.map((header, index) => {
          const effectiveKey = getEffectiveColumnKey(header, index);
          const { cellProps = {} } = header;
          const { align, sx: headerSx, ...restCellProps } = cellProps;

          // If header has subHeaders, span across them
          if (header.subHeaders && header.subHeaders.length > 0) {
            return (
              <TableCell
                key={`${effectiveKey}-${index}`}
                align='center'
                colSpan={header.subHeaders.length}
                sx={{
                  whiteSpace: 'nowrap',
                  border: `1px solid ${dimWhiteColor}`,
                  textTransform: 'uppercase',
                  ...headerSx,
                }}
                {...restCellProps}
              >
                {typeof header.header === 'string' ? (
                  <Translations text={header.header} />
                ) : (
                  header.header
                )}
              </TableCell>
            );
          }

          // Header without subHeaders - span 2 rows
          return (
            <TableCell
              key={`${effectiveKey}-${index}`}
              align={align}
              rowSpan={2}
              sx={{
                whiteSpace: 'nowrap',
                border: `1px solid ${dimWhiteColor}`,
                textTransform: 'uppercase',
                ...headerSx,
              }}
              {...restCellProps}
            >
              {typeof header.header === 'string' ? (
                <Translations text={header.header} />
              ) : (
                header.header
              )}
            </TableCell>
          );
        })}
      </StyledTableRow>

      {/* Second row: Sub-headers */}
      <StyledTableRow id={`${id}-sub-header-row`}>
        {headers.map((header, index) => {
          if (!header.subHeaders || header.subHeaders.length === 0) {
            // Skip headers without subHeaders (they're already rendered with rowSpan=2)
            return null;
          }

          const effectiveHeaderKey = getEffectiveColumnKey(header, index);

          return (
            <Fragment key={`${effectiveHeaderKey}-subheaders`}>
              {header.subHeaders.map((subHeader, subIndex) => {
                const effectiveSubKey = getEffectiveColumnKey(subHeader, subIndex);
                const { cellProps: subCellProps = {} } = subHeader;
                const { sx: subHeaderSx, align, ...restSubCellProps } = subCellProps;

                return (
                  <TableCell
                    key={`${effectiveHeaderKey}-${effectiveSubKey}-${subIndex}`}
                    align={align}
                    sx={{
                      whiteSpace: 'nowrap',
                      border: `1px solid ${dimWhiteColor}`,
                      textTransform: 'uppercase',
                      ...subHeaderSx,
                    }}
                    {...restSubCellProps}
                  >
                    {subHeader.header}
                  </TableCell>
                );
              })}
            </Fragment>
          );
        })}
      </StyledTableRow>
    </>
  );
};

export const TableBodyContent: React.FC<TableBodyContentProps> = ({
  headers,
  rows,
  loading,
  onRowClick,
  id,
}) => {
  if (rows.length === 0) {
    return (
      <StyledTableRow id={`${id}-empty-row`}>
        <TableCell colSpan={headers.length} align='center' sx={{ height: '50px !important' }}>
          {loading ? <ShapeLoader /> : <Translations text='common.noDataToShow' />}
        </TableCell>
      </StyledTableRow>
    );
  }

  return (
    <>
      {rows.map((row, rowIndex) => (
        <StyledTableRow
          key={`row-${rowIndex}`}
          id={`${id}-row-${rowIndex}`}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;

            e?.preventDefault();
            onRowClick?.(row);
          }}
          sx={onRowClick ? tableRowStyle : {}}
        >
          {headers.map((header, headerIndex) => {
            const effectiveHeaderKey = getEffectiveColumnKey(header, headerIndex);
            if (header.subHeaders) {
              return (
                <Fragment key={`${rowIndex}-${effectiveHeaderKey}-fragment`}>
                  {header.subHeaders.map((subHeader, subIndex) => {
                    const effectiveSubKey = getEffectiveColumnKey(subHeader, subIndex);
                    const cellData = (row[effectiveHeaderKey] as SubCell)?.[effectiveSubKey];
                    const cell = cellData?.value;

                    // Merge cellProps from subHeader definition and cell data
                    const { cellProps: subHeaderCellProps = {} } = subHeader;
                    const { cellProps: cellDataProps = {} } = cellData || {};

                    return (
                      <TableCell
                        key={`${rowIndex}-${effectiveHeaderKey}-${effectiveSubKey}`}
                        {...subHeaderCellProps}
                        {...cellDataProps}
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        sx={{ ...subHeaderCellProps?.sx, ...cellDataProps?.sx } as SxProps<Theme>}
                      >
                        {cell ?? ''}
                      </TableCell>
                    );
                  })}
                </Fragment>
              );
            }

            const cell = row[effectiveHeaderKey] as Cell;
            const { cellProps: headerCellProps = {} } = header;
            const { cellProps: bodyCellProps = {} } = cell || {};

            return (
              <TableCell
                key={`${effectiveHeaderKey}-${rowIndex}`}
                {...headerCellProps}
                {...bodyCellProps}
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sx={{ ...headerCellProps?.sx, ...bodyCellProps?.sx } as SxProps<Theme>}
              >
                {cell?.value ?? ''}
              </TableCell>
            );
          })}
        </StyledTableRow>
      ))}
    </>
  );
};
