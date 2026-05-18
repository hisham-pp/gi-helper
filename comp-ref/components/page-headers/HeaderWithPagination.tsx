import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Pagination from '@/core/components/pagination';
import { usePermission } from '@/hooks/use-permission';
import Search from '../Search';
import { Container } from './styled-components';
import { HeaderWithPaginationProps } from './types';
import { ActionHeader } from '.';

const HeaderWithPagination: React.FC<HeaderWithPaginationProps> = ({
  page,
  title,
  totalCount,
  entities = [],
  cardProps = {},
  variant,
  searchContainerProps = {},
  containedButtonLabel = 'common.create',
  showContainedButton = true,
  showOutlineButton = true,
  outlineButtonLabel = 'common.cancel',
  showSearch = true,
  showExportMenu = false,
  exportMenuProps = {},
  onCreate = () => {},
  onClickOutlinedButton = () => {},
  onPageChange,
  onSearchChange,
  extendTitleEnd,
  extendSearchEnd,
  extendSearchBottom,
  containedButtonPermissionKeys,
  showCount = false,
  ...rest
}) => {
  const { havePermission } = usePermission();

  const canShowContainedButton =
    showContainedButton &&
    (containedButtonPermissionKeys
      ? containedButtonPermissionKeys.every((key) => havePermission(key))
      : true);
  const getDisplayedCount = () => {
    if (!totalCount && !entities?.length) return '0/0';
    return `${entities?.length || 0}/${totalCount || 0}`;
  };

  return (
    <Container {...cardProps}>
      <ActionHeader
        variant={variant}
        title={title}
        showBackArrow={false}
        exportMenuProps={exportMenuProps}
        showExportMenu={showExportMenu}
        containedButtonProps={{
          label: containedButtonLabel,
          onClick: onCreate,
          isShow: canShowContainedButton,
        }}
        outlineButtonProps={{
          isShow: showOutlineButton,
          label: outlineButtonLabel,
          onClick: onClickOutlinedButton,
        }}
        extendTitleEnd={extendTitleEnd}
        {...rest}
      />
      <Divider />
      <Box className='wrapper'>
        <Box display='flex' flexDirection='column' gap={1.5} width='100%'>
          <Box display='flex' alignItems='center' gap={2} flexWrap='nowrap' width='100%'>
            {showSearch && (
              <Box className='search-container' {...searchContainerProps}>
                <Search onChange={onSearchChange} />
              </Box>
            )}
            {extendSearchEnd && extendSearchEnd()}
          </Box>
          <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
            <Box>
              {showCount && (
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: 12 }}>
                  Showing {getDisplayedCount()}
                </Typography>
              )}
            </Box>
            <Pagination page={page} totalCount={totalCount} onChange={onPageChange} />
          </Box>
        </Box>
      </Box>
      {extendSearchBottom && <Box sx={{ px: 3, pb: 1.5 }}>{extendSearchBottom()}</Box>}
    </Container>
  );
};

export default memo(HeaderWithPagination);
