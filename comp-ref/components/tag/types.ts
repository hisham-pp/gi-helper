import { MultiValue, SingleValue } from 'react-select';
import { BaseOption } from '@/types';
import { Tag } from '@/types/recruitment/tag';

export type TagValue = (BaseOption & { color?: string }) | null;

export type TagsWithTooltipProps = {
  items: Tag[];
  limit?: number;
};

export type TagChipProps = {
  name?: string;
  color?: string;
  truncate?: boolean;
};

export type TagDropdownProps = {
  options: TagValue[];
  label?: string;
  isMulti?: boolean;
  value?: TagValue | TagValue[];
  onChange?: (newValue: SingleValue<TagValue> | MultiValue<TagValue>) => void;
  onCreateOption?: (inputValue: string) => void;
  isRequired?: boolean;
  error?: boolean;
  helperText?: string;
  isCreatable?: boolean;
};
