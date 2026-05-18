import { UniqueIdentifier } from '@dnd-kit/core';
import { CardProps } from '@mui/material/Card';
import { Tag } from '@/types/recruitment/tag';

export type Id = UniqueIdentifier;

export type BoardColumn<T> = {
  columnId: Id;
  heading: string;
  color: string;
  items: T[];
  boardTag?: Tag;
  listIcon?: string;
};

type CommonProps<T> = {
  cardProps?: Omit<CardProps, 'style' | 'ref'>;
  renderItemCard?: (item: T) => React.JSX.Element;
};

export type BoardProps<T> = CommonProps<T> & {
  boardColumns: BoardColumn<T>[];
  onColumnDragOver: (activeColumnId: Id, overColumnId: Id) => void;
  onColumnDragEnd: (activeColumnId: Id, overColumnId: Id) => void;
  onItemDragOver: (activeTaskId: Id, overTaskId: Id, activeColumnId: Id, overColumnId: Id) => void;
  onItemDragEnd: (activeTaskId: Id, overTaskId: Id, activeColumnId: Id, overColumnId: Id) => void;
  showColumnOption?: (column: BoardColumn<T>) => boolean;
  onEditList?: (column: BoardColumn<T>) => void;
  onDeleteList?: (column: BoardColumn<T>) => void;
  onShortlistClick?: () => void;
  onRefresh?: () => void;
};

export type ColumnProps<T> = CommonProps<T> & {
  column: BoardColumn<T>;
  onEditList?: (column: BoardColumn<T>) => void;
  onDeleteList?: (column: BoardColumn<T>) => void;
  showColumnOption?: (column: BoardColumn<T>) => boolean;
  onShortlistClick?: () => void;
  onRefresh?: () => void;
};

export type ItemCardProps<T> = CommonProps<T> & {
  columnId?: Id;
  item: T;
};
