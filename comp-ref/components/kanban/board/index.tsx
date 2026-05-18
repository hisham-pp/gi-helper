'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Any } from '@/types';
import Column from './Column';
import ItemCard from './ItemCard';
import { ColumnContainer } from './styled-components';
import { BoardColumn, BoardProps, Id } from './types';

const Board = <T extends { id: Id }>({
  boardColumns,
  cardProps,
  renderItemCard,
  onColumnDragEnd,
  onItemDragEnd,
  onItemDragOver,
  onColumnDragOver,
  showColumnOption,
  onDeleteList,
  onEditList,
  onShortlistClick,
  onRefresh,
}: BoardProps<T>) => {
  const [activeColumn, setActiveColumn] = useState<BoardColumn<T> | null>(null);
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const dragRefs = useRef({
    sourceColumnId: null,
    destinationColumnId: null,
    originalColumnId: null,
  });

  const columnsIds = useMemo(
    () => boardColumns?.map((col) => `column-${col.columnId}`),
    [boardColumns],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );

  const isColumn = (data: Any) => data?.type === 'column';
  const isItem = (data: Any) => data?.type === 'item';

  function extractNumberFromId(id: Any): Any {
    const match = id.match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  function handleDragStart(event: DragStartEvent) {
    if (!event) return null;

    const { type, column, item } = event.active.data.current || {};

    if (type === 'column') {
      setActiveColumn(column);
    } else if (type === 'item') {
      setActiveItem(item);
      dragRefs.current.originalColumnId = event.active.data.current?.columnId || null;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event) return null;

    const { active, over } = event;

    setActiveColumn(null);
    setActiveItem(null);

    if (!over) return;

    const {
      id: activeId,
      data: { current: activeData },
    } = active;
    const {
      id: overId,
      data: { current: overData },
    } = over;

    if (isColumn(activeData) && isColumn(overData)) {
      onColumnDragEnd(extractNumberFromId(activeId), extractNumberFromId(overId));
    } else if (isItem(activeData)) {
      const originalColumnId = dragRefs.current.originalColumnId;
      const destinationColumnId = overData?.columnId || overData?.id;

      if (originalColumnId && destinationColumnId) {
        onItemDragEnd(
          extractNumberFromId(activeId),
          extractNumberFromId(overId),
          originalColumnId,
          destinationColumnId,
        );
      } else {
        console.warn('Invalid drag references for item', { originalColumnId, destinationColumnId });
      }
    } else {
      console.warn('Unrecognized drag types', activeData, overData);
    }

    dragRefs.current = {
      sourceColumnId: null,
      destinationColumnId: null,
      originalColumnId: null,
    };
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event) return null;

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const {
      id: activeId,
      data: { current: activeData },
    } = active;
    const {
      id: overId,
      data: { current: overData },
    } = over;

    const activeColumnId = activeData?.columnId;
    const overColumnId = overData?.columnId;

    if (isItem(activeData)) {
      onItemDragOver(
        extractNumberFromId(activeId),
        extractNumberFromId(overId),
        activeColumnId,
        overColumnId,
      );
    } else if (isColumn(activeData)) {
      onColumnDragOver(extractNumberFromId(activeId), extractNumberFromId(overId));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <ColumnContainer>
        <SortableContext items={columnsIds}>
          {boardColumns?.map((column, i) => {
            return (
              <Column
                key={`column-${i}`}
                column={column}
                cardProps={cardProps}
                renderItemCard={renderItemCard}
                showColumnOption={showColumnOption}
                onDeleteList={onDeleteList}
                onEditList={onEditList}
                onShortlistClick={onShortlistClick}
                onRefresh={onRefresh}
              />
            );
          })}
        </SortableContext>
      </ColumnContainer>
      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <Column
              column={activeColumn}
              cardProps={cardProps}
              renderItemCard={renderItemCard}
              showColumnOption={showColumnOption}
              onDeleteList={onDeleteList}
              onEditList={onEditList}
            />
          )}
          {activeItem && (
            <ItemCard item={activeItem} cardProps={cardProps} renderItemCard={renderItemCard} />
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

export default Board;
