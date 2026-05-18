import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '@mui/material/Card';
import { Id, ItemCardProps } from './types';

const ItemCard = <T extends { id: Id }>({
  columnId,
  item,
  cardProps = {},
  renderItemCard,
}: ItemCardProps<T>) => {
  const { id } = item || {};
  const { sx: cardSx, ...cardRest } = cardProps;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: `item-${id ?? 0}`,
    data: { type: 'item', item, columnId },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <Card
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0 : 1,
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
      }}
      sx={{
        p: 4,
        overflow: 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'opacity 0.2s ease-in-out',
        ...cardSx,
      }}
      {...cardRest}
    >
      {renderItemCard?.(item)}
    </Card>
  );
};

export default ItemCard;
