'use client';

import React from 'react';
import Grid from '@mui/material/Grid';
import MUIPagination from '@mui/material/Pagination';
import { getTotalPage } from '@/constant/pagination';
import useDebounce from '@/hooks/use-debounce';
import Icon from '../icon';
import Translations from '../translations';
import { PageNavButton, StyledPaginationItem } from './styled-components';
import { PaginationProps } from './types';

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalCount = 1,
  variant,
  shape = 'rounded',
  position = 'last',
  onChange,
}) => {
  const totalPage = getTotalPage(totalCount);

  const positions = { first: 'flex-start', last: 'flex-end' };

  const debounce = useDebounce(
    (event: React.ChangeEvent<unknown>, page: number) => onChange && onChange(page),
    300,
  );

  const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
    debounce(event, page);
  };

  return (
    <Grid container justifyContent={positions[position]}>
      <MUIPagination
        page={page}
        shape={shape}
        variant={variant}
        count={totalPage}
        showFirstButton
        showLastButton
        onChange={handleChange}
        renderItem={(item) => {
          return (
            <StyledPaginationItem
              slots={{
                next: (item) => {
                  return (
                    <PageNavButton disabled={item?.disabled}>
                      <Translations text='common.next' />
                      &nbsp;
                      <Icon icon='jam:arrow-right' />
                    </PageNavButton>
                  );
                },
                previous: (item) => (
                  <PageNavButton disabled={item?.disabled}>
                    <Icon icon='jam:arrow-left' />
                    &nbsp;
                    <Translations text='common.previous' />
                  </PageNavButton>
                ),
              }}
              {...item}
            />
          );
        }}
      />
    </Grid>
  );
};

export default React.memo(Pagination);
