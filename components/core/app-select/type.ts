import type { GroupBase, Props as SelectProps } from "react-select";

export interface AppSelectOption {
  readonly label: string;
  readonly value: string;
}

export type AppSelectVariant = "filled" | "outlined";

export interface AppSelectProps extends Omit<
  SelectProps<AppSelectOption, false, GroupBase<AppSelectOption>>,
  "onChange" | "value"
> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: AppSelectOption[];
  variant?: AppSelectVariant;
}
