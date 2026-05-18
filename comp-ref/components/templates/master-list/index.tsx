'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { PaginationHeader } from '@/components/page-headers';
import ActionHeader from '@/components/page-headers/HeaderWithButtons';
import AppTable from '@/core/components/app-table';
import { MasterListProps } from './types';

const MasterList: React.FC<MasterListProps & { showPagination?: boolean }> = ({
  title,
  page,
  bordered,
  rows = [],
  headers = [],
  totalCount,
  dataLoading,
  sortOptions,
  variant = 'standard',
  paperProps = {},
  headerCardProps = {},
  searchContainerProps,
  containedButtonLabel,
  showContainedButton,
  containedButtonPermissionKeys,
  showOutlineButton,
  outlineButtonLabel,
  showSearch = true,
  showExportMenu = false,
  exportMenuProps = {},
  stackProps = {},
  onCreate,
  onClickOutlinedButton,
  onRowClick,
  onPageChange,
  onSearchChange,
  extendTitleEnd,
  extendSearchEnd,
  extendSearchBottom,
  showPagination = true,
  showCount,
  ...rest
}) => {
  const { sx: headerCardSx, ...headerCardRest } = headerCardProps;
  const { sx: paperSx, ...paperPropsRest } = paperProps;

  return (
    <Stack mt={2} gap={2} {...stackProps}>
      {showPagination ? (
        <PaginationHeader
          variant={variant}
          title={title}
          page={page}
          totalCount={totalCount}
          entities={rows}
          searchContainerProps={searchContainerProps}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onCreate={onCreate}
          extendTitleEnd={extendTitleEnd}
          extendSearchEnd={extendSearchEnd}
          containedButtonLabel={containedButtonLabel}
          showContainedButton={showContainedButton}
          showSearch={showSearch}
          showExportMenu={showExportMenu}
          exportMenuProps={exportMenuProps}
          showOutlineButton={showOutlineButton}
          outlineButtonLabel={outlineButtonLabel}
          onClickOutlinedButton={onClickOutlinedButton}
          extendSearchBottom={extendSearchBottom}
          containedButtonPermissionKeys={containedButtonPermissionKeys}
          showCount={showCount}
          cardProps={{
            elevation: bordered ? 0 : 1,
            sx: {
              ...headerCardSx,
              ...(bordered ? { border: ({ palette: p }) => `1px solid ${p?.grey[300]}` } : {}),
            },
            ...headerCardRest,
          }}
          {...rest}
        />
      ) : (
        <Box
          sx={{
            ...(bordered
              ? {
                  border: (theme) => `1px solid ${theme.palette.grey[300]}`,
                  borderRadius: (t) => t.shape.borderRadius,
                  overflow: 'hidden',
                }
              : {}),
          }}
        >
          <ActionHeader
            title={title}
            variant={variant}
            showBackArrow={false}
            containedButtonProps={{
              label: containedButtonLabel,
              onClick: onCreate,
              isShow: showContainedButton,
              ...(containedButtonPermissionKeys
                ? { permissionKeys: containedButtonPermissionKeys }
                : {}),
            }}
            outlineButtonProps={{
              label: outlineButtonLabel,
              onClick: onClickOutlinedButton,
              isShow: showOutlineButton,
            }}
            exportMenuProps={exportMenuProps}
            showExportMenu={showExportMenu}
            extendTitleEnd={extendTitleEnd}
            {...rest}
          />
        </Box>
      )}
      <Paper elevation={0} sx={{ p: 2, ...paperSx }} {...paperPropsRest}>
        {rest.children ? (
          rest.children
        ) : (
          <AppTable
            headers={headers}
            rows={rows}
            loading={dataLoading}
            onRowClick={onRowClick}
            sortOptions={sortOptions}
            // Pass through inline filter props if provided in rest
            {...(rest.enableInlineFilters !== undefined && {
              enableInlineFilters: rest.enableInlineFilters,
            })}
            {...(rest.filterValues && { filterValues: rest.filterValues })}
            {...(rest.onFilterChange && { onFilterChange: rest.onFilterChange })}
          />
        )}
      </Paper>
    </Stack>
  );
};

export default memo(MasterList);
