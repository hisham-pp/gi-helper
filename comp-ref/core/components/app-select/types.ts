import { FormControlProps } from '@mui/material/FormControl';
import {
  ActionMeta,
  GetOptionLabel,
  GetOptionValue,
  GroupBase,
  Props,
  StylesConfig,
} from 'react-select';
import { Any, BaseOption } from '@/types';

export type SelectSize = 'small' | 'medium';

export type BaseSelectProps<T> = {
  label?: string;
  placeholder?: string;
  options?: T[];
  value?: T | T[] | null;
  isMulti?: boolean;
  id?: string;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  isClearable?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  error?: boolean;
  helperText?: string;
  chipCount?: number;
  isCreatable?: boolean;
  size?: SelectSize;
  components?: Props['components'];
  formControlProps?: FormControlProps;
  menuPosition?: 'fixed' | 'absolute';
  customStyles?: StylesConfig<T, boolean, GroupBase<T>>;
  getOptionLabel?: GetOptionLabel<T>;
  getOptionValue?: GetOptionValue<T>;
  isOptionDisabled?: Props['isOptionDisabled'];
  onChange?: (newValue: Any, actionMeta?: ActionMeta<T>) => void;
  onCreateOption?: (inputValue: string) => void;
};

export type ForwardBaseSelect = <T extends BaseOption>(
  props: BaseSelectProps<T>,
) => React.JSX.Element;
