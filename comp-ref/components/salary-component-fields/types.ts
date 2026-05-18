import { ChangeEvent, ReactNode } from 'react';
import { SxProps, TableCellProps } from '@mui/material';
import { BenefitFrequency } from '@/enums/salary-components';
import { ExtendedSalaryComponent, SalaryPackageDetail } from '@/types/employee';
import { SalaryComponents } from '@/types/payroll/salaryComponents';

export type TableHeaderProps = {
  columns: { label: string; className?: string; sx?: SxProps }[];
};

export type ReusableHeaderProps = {
  title?: string;
  titleStyles?: React.CSSProperties;
};
export type DeductionRowProps = {
  label: string;
  type: ReactNode;
  isViewMode?: boolean;
  value?: number | string | null;
};

export type SalaryComponentFieldsProps = {
  costToCompany?: number | '';
  isHosteler?: boolean;
  salaryComponents?: SalaryComponents[];
  isGratuityEnabled?: boolean;
  isEpfEnabled?: boolean;
  isEsiEnabled?: boolean;
  showCalculationType?: boolean;
  salaryPackageDetails?: SalaryPackageDetail;
  allowMonthlyAmountEdit?: boolean;
  showPercentage?: boolean;
  otherPay?: number;
  isViewMode?: boolean;
  isMonthlyCtcFormat?: boolean;
  otherAllowanceComponent?: SalaryComponents;
  showOtherPayInfo?: boolean;
  grossSalary?: number | '';
  isVdaEnabled?: boolean;
  isShowDeductions?: boolean;
  onChange?: (value: number | string, component: ExtendedSalaryComponent) => void;
  handleVdaChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export type PercentageBoxProps = { value: number | string; endAdornmentLabel?: string };

export type ComponentRowProps = ExtendedSalaryComponent & {
  allowMonthlyAmountEdit?: boolean;
  showCalculationTypeField?: boolean;
  showPercentage?: boolean;
  isYearlyCTC?: boolean;
  additionalText?: ReactNode;
  nameCellProps?: TableCellProps;
  nameCellSx?: SxProps;
  isVdaEnabled?: boolean;
  isViewMode?: boolean;
  isNotAffectedByCTC?: boolean;
  formula?: string | null;
  benefitFrequency?: BenefitFrequency;
  onAmountChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleVdaChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export type SalaryTableProps = {
  children: React.ReactNode;
};
