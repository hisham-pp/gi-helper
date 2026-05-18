'use client';

import React, { memo, useMemo } from 'react';
import { Paper, TableContainer, useTheme } from '@mui/material';
import { ContributionPercentage } from '@/enums/employee';
import { SalaryComponentName, SalaryComponentType } from '@/enums/salary-components';
import useSalaryLabels from '@/hooks/use-salary-labels';
import { TableCard } from '@/views/private/payroll/primary-panels/over-view/styled-components';
import ComponentRow from './ComponentRow';
import {
  DeductionRow,
  otherAllowanceInfoText,
  ReusableHeader,
  TableHeader,
} from './HelperComponents';
import { StyledFooter } from './styled-components';
import { SalaryComponentFieldsProps } from './types';

const { EARNINGS, DEDUCTIONS, BENEFIT } = SalaryComponentType;
const { EMPLOYEE_PERCENTAGE, GRATUITY_PERCENTAGE } = ContributionPercentage;
const { HOSTEL_FEE, MESS_FEE } = SalaryComponentName;

const getComponentType = (item: any): string | undefined =>
  item?.type || (item?.salaryComponentType as any)?.id || item?.salaryComponentType;

const SalaryComponentFields: React.FC<SalaryComponentFieldsProps> = ({
  otherPay = 0,
  costToCompany = 0,
  salaryComponents = [],
  isHosteler = false,
  isGratuityEnabled,
  isEpfEnabled,
  isEsiEnabled,
  showCalculationType = true,
  salaryPackageDetails,
  allowMonthlyAmountEdit = false,
  showPercentage = false,
  otherAllowanceComponent,
  isViewMode = false,
  showOtherPayInfo = true,
  isShowDeductions = true,
  isMonthlyCtcFormat,
  grossSalary = 0,
  onChange,
  isVdaEnabled,
  handleVdaChange,
}) => {
  const theme = useTheme();
  const { getSalaryLabel } = useSalaryLabels();

  const ctcStyle = { color: 'text.main', fontWeight: 600 };

  const columns = useMemo(
    () => [
      { label: 'salary.salaryComponents', className: 'table-cell' },
      ...(showCalculationType
        ? [{ label: 'salary.calculationType', className: 'table-cell' }]
        : []),
      { label: 'salary.monthlyAmount', className: 'table-cell-right' },
      { label: 'salary.annualAmount', className: 'table-cell-right' },
    ],
    [showCalculationType],
  );

  const earnings = useMemo(
    () => salaryComponents?.filter((item) => getComponentType(item) === EARNINGS),
    [salaryComponents],
  );

  const otherDeductions = useMemo(
    () =>
      salaryComponents
        ?.filter((item) => getComponentType(item) === DEDUCTIONS)
        ?.filter((item) => {
          if (item.name === HOSTEL_FEE || item.name === MESS_FEE) {
            return isHosteler;
          }
          return true;
        }),
    [salaryComponents, isHosteler],
  );

  const benefits = useMemo(
    () => salaryComponents?.filter((item) => getComponentType(item) === BENEFIT),
    [salaryComponents],
  );

  const renderDeductions = () => {
    const deductions = [
      {
        enabled: isGratuityEnabled,
        label: 'salary.Gratuity',
        type: `${GRATUITY_PERCENTAGE}% of Basic Salary + DA`,
        value: Math.round(Number(salaryPackageDetails?.employerGratuityContributionYearly)),
      },
      {
        enabled: isEpfEnabled,
        label: 'salary.EPFEmployerContribution',
        type: `${EMPLOYEE_PERCENTAGE}% of Restricted PF Wages`,
        value: salaryPackageDetails?.employerEpfContributionYearly,
      },
      {
        enabled: isEsiEnabled,
        label: 'salary.ESIEmployerContribution',
        type: `${salaryPackageDetails?.employerEsiContributionPercentage}% of ESI Wages`,
        value: salaryPackageDetails?.employerEsiContributionYearly,
      },
    ].filter(({ enabled }) => enabled);

    return deductions.map(({ label, type, value }) => (
      <DeductionRow key={label} isViewMode={isViewMode} label={label} type={type} value={value} />
    ));
  };

  return (
    <TableCard>
      <div className='header-wrapper'>
        <TableHeader columns={columns} />
      </div>
      <div className='body'>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
          <ReusableHeader
            title='salary.earnings'
            titleStyles={{ color: theme.palette.success.light }}
          />
          {earnings?.map((component) => (
            <ComponentRow
              key={component.id}
              showPercentage={showPercentage}
              showCalculationTypeField={showCalculationType}
              allowMonthlyAmountEdit={allowMonthlyAmountEdit}
              onAmountChange={(e) => onChange?.(e?.target?.value, component)}
              isVdaEnabled={isVdaEnabled}
              isViewMode={isViewMode}
              handleVdaChange={handleVdaChange}
              {...component}
            />
          ))}
          {isShowDeductions && isGratuityEnabled && isEpfEnabled && isEsiEnabled && (
            <>
              <ReusableHeader
                title='salary.deductions'
                titleStyles={{ color: theme.palette.error.main }}
              />
              {renderDeductions()}
            </>
          )}
          {otherDeductions?.length > 0 && (
            <>
              <ReusableHeader
                title='salary.otherDeductions'
                titleStyles={{ color: theme.palette.primary.main }}
              />
              {otherDeductions?.map((component) => (
                <ComponentRow
                  key={component.id}
                  showPercentage={showPercentage}
                  showCalculationTypeField={showCalculationType}
                  allowMonthlyAmountEdit={allowMonthlyAmountEdit}
                  onAmountChange={(e) => onChange?.(e?.target?.value, component)}
                  {...component}
                />
              ))}
            </>
          )}
          {otherAllowanceComponent && (
            <ComponentRow
              name={otherAllowanceComponent?.name}
              additionalText={showOtherPayInfo ? otherAllowanceInfoText : null}
              value={otherPay}
              isYearlyCTC={salaryPackageDetails?.yearlyCTC}
              nameCellProps={{ sx: { flex: 2 } }}
              nameCellSx={{ fontWeight: 700 }}
            />
          )}
          <StyledFooter>
            <ComponentRow
              name={getSalaryLabel('costToCompany')}
              value={isMonthlyCtcFormat ? costToCompany : grossSalary}
              isYearlyCTC={salaryPackageDetails?.yearlyCTC}
              nameCellProps={{ sx: { flex: showCalculationType ? 2 : 1 } }}
              nameCellSx={ctcStyle}
            />
          </StyledFooter>
          {benefits?.length > 0 && (
            <>
              <ReusableHeader
                title='salary.benefits'
                titleStyles={{ color: theme.palette.info.main }}
              />
              {benefits?.map((component) => (
                <ComponentRow
                  key={component.id}
                  showPercentage={showPercentage}
                  showCalculationTypeField={showCalculationType}
                  allowMonthlyAmountEdit={allowMonthlyAmountEdit}
                  onAmountChange={(e) => onChange?.(e?.target?.value, component)}
                  isViewMode={isViewMode}
                  benefitFrequency={component.benefitFrequency}
                  {...component}
                />
              ))}
            </>
          )}
        </TableContainer>
      </div>
    </TableCard>
  );
};

export default memo(SalaryComponentFields);
