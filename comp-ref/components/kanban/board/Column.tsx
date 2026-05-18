'use client';

import Image from 'next/image';
import React, { useCallback, useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { NO_CANDIDATE } from '@/configs/image-paths';
import AppMenu from '@/core/components/app-menu';
import Icon from '@/core/components/icon';
import { StatusEnumeration } from '@/enums/status';
import colors from '@/utils/colors';
import { AiInsightButton } from '@/views/private/recruitment/candidate/styled-components';
import ItemCard from './ItemCard';
import { ColumnPaper } from './styled-components';
import { ColumnProps, Id } from './types';

const { OPEN } = StatusEnumeration;
const {
  boardColors: { aiShortlisted },
} = colors;

const aiInsightButtonStyle = {
  background: aiShortlisted,
  fontSize: 12,
  mb: 0,
};

const Column = <T extends { id: Id }>({
  column,
  cardProps,
  renderItemCard,
  showColumnOption = () => true,
  onDeleteList,
  onEditList,
  onShortlistClick,
  onRefresh,
}: ColumnProps<T>) => {
  const { columnId, heading, color, items, listIcon } = column;

  const itemIds = useMemo(() => {
    const seen = new Set<string>();
    return items?.map((item, index) => {
      let key = `item-${item?.id}`;
      if (seen.has(key)) key = `${key}-${index}`;
      seen.add(key);
      return key;
    });
  }, [items]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: `column-${columnId}`,
    data: { type: 'column', column, columnId },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const renderColumnOption = useCallback(() => {
    if (!showColumnOption?.(column)) {
      return null;
    }

    return (
      <Box display='flex' alignItems='center' gap={1}>
        {heading === OPEN && (
          <>
            <AiInsightButton sx={aiInsightButtonStyle} onClick={onShortlistClick}>
              AI Shortlist
            </AiInsightButton>
            <IconButton size='small' onClick={onRefresh} title='Refresh board'>
              <Icon icon='mdi:refresh' fontSize='small' />
            </IconButton>
          </>
        )}
        <AppMenu
          iconButtonProps={{ sx: { p: 0 } }}
          options={[
            {
              text: 'Edit List',
              menuItemProps: { onClick: () => onEditList?.(column) },
            },
            {
              text: 'Delete List ',
              menuItemProps: { onClick: () => onDeleteList?.(column) },
            },
          ]}
        />
      </Box>
    );
  }, [showColumnOption, column, heading, onEditList, onDeleteList, onShortlistClick, onRefresh]);

  return (
    <ColumnPaper
      color={color}
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
      }}
      className={isDragging ? 'dragging' : ''}
    >
      <Box className='column-header' {...attributes} {...listeners}>
        <Box className='header-wrapper'>
          {listIcon && (
            <Image src={listIcon} alt='icon' width={24} height={24} objectFit='contain' />
          )}
          <Typography className='header'>{heading?.replaceAll('_', ' ')}</Typography>
          {items?.length > 0 && <Typography className='item-count'>{items?.length}</Typography>}
        </Box>
        {renderColumnOption()}
      </Box>
      <Stack gap={3} className='item-wrapper'>
        {items?.length > 0 ? (
          <SortableContext items={itemIds}>
            {items?.map((item, index) => (
              <ItemCard
                key={itemIds?.[index] ?? item?.id}
                item={item}
                columnId={columnId}
                cardProps={cardProps}
                renderItemCard={renderItemCard}
              />
            ))}
          </SortableContext>
        ) : (
          <Stack alignItems='center' justifyContent='flex-end' height='50%'>
            <Image alt='no_candidate' src={NO_CANDIDATE} width={120} height={120} />
          </Stack>
        )}
      </Stack>
    </ColumnPaper>
  );
};

export default Column;
