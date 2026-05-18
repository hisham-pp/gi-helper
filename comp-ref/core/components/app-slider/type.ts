import { ComponentProps } from 'react';
import Slider from '@mui/material/Slider';

type SliderProps = ComponentProps<typeof Slider>;

export type AppSliderProps = SliderProps & {
  isRequired?: boolean;
  label?: string;
  helperText?: string;
  error?: boolean;
  showValue?: boolean;
  editableValue?: boolean;
  onValueChange?: (value: number) => void;
};

export type EditableValueProps = {
  value: AppSliderProps['value'];
  min: number;
  max: number;
  step: number | null;
  onChange: AppSliderProps['onChange'];
  disabled: boolean;
  editable: boolean;
  error?: boolean;
};

export default AppSliderProps;
