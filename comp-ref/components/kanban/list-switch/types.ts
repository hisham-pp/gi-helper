export type SwitchType = 'list' | 'kanban';

export type KanbanListSwitchProps = {
  active?: SwitchType;
  onChange?: (next: SwitchType) => void;
};
