'use client';

import React, { useCallback, useMemo } from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Icon from '@/core/components/icon';
import ShapeLoader from '@/core/components/loaders/Shape';
import { FormRow } from '../form-helpers';
import { FormField } from '../form-helpers/types';
import { DataRow, ListHeader, StyledAccordion, StyledTableContainer } from './styled-components';
import { AccordionTableCell, AccordionTableProps } from './types';

const loaderBoxStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
};

const AccordionTable: React.FC<AccordionTableProps> = ({ headers, rows, loading }) => {
  const fields: FormField[] = useMemo(
    () =>
      headers?.map((item) => {
        const { header, align, size } = item;

        return {
          size,
          component: <Box textAlign={align}>{header}</Box>,
        };
      }),
    [headers],
  );

  const generateRowFields = useCallback(
    (subItems?: AccordionTableCell[]) =>
      headers.map((header) => {
        const cell = subItems?.find((sub) => sub.key === header.key);

        return {
          size: header.size,
          component: <Box textAlign={cell?.align}>{cell?.value}</Box>,
        };
      }),
    [headers],
  );

  return (
    <StyledTableContainer>
      <Stack>
        <ListHeader>
          <FormRow justifyContent='space-between' fields={fields} />
        </ListHeader>
        {rows?.map((row, i) => (
          <StyledAccordion key={`row-${i}`} disableGutters>
            <AccordionSummary
              className='summary'
              expandIcon={<Icon icon='ic:baseline-expand-more' />}
            >
              {row?.title}
            </AccordionSummary>
            <AccordionDetails className='details'>
              {loading ? (
                <ShapeLoader boxProps={loaderBoxStyle} />
              ) : (
                row?.subItems?.map((subItems, subIndex) => (
                  <DataRow key={`sub-item-${subIndex}`}>
                    <FormRow justifyContent='space-between' fields={generateRowFields(subItems)} />
                  </DataRow>
                ))
              )}
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Stack>
    </StyledTableContainer>
  );
};

export default AccordionTable;
