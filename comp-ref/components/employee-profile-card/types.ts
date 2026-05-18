import { ReactNode } from 'react';

export type EmployeeProfileCardProps = {
  employeeData?: ProfileChipOptions[];
  employeeName?: string;
  employeeEmail?: string;
  employeeProfileUrl?: string;
};

type Variant = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

type ValueOption = {
  id: number;
  label: string;
  variant?: Variant;
  value?: string;
};

type ComponentOption = {
  id: number;
  variant: Variant;
  component: ReactNode;
};

export type ProfileChipOptions = ValueOption | ComponentOption;

export type FeedbackIconsProps = {
  likeCount: number;
  dislikeCount: number;
};
