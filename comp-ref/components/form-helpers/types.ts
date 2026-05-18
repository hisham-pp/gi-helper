import { GridProps } from '@mui/material/Grid';
import { StackProps } from '@mui/material/Stack';

export type FormField = {
  component: React.JSX.Element;
  size?: { xs?: number; sm?: number; md?: number; lg?: number };
  key?: string;
};

export type AppFormRowProps = {
  fields: FormField[];
  spacing?: GridProps['spacing'];
  alignItems?: GridProps['alignItems'];
  justifyContent?: GridProps['justifyContent'];
};

export type AppFormSectionProps = StackProps;
