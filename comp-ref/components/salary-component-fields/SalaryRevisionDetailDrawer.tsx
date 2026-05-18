'use client';

import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import DrawerWithControls from '@/components/drawer-with-controls';
import { FormSection } from '@/components/form-helpers';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import useSalaryLabels from '@/hooks/use-salary-labels';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchEmployeeSalaryRevisalHistoryById } from '@/redux/employee/salary/salary.slice';
import { fetchAllSalaryComponents } from '@/redux/payroll/salary-component/salary-component.slice';
import { SalaryPackageDetail } from '@/types/employee';
import { formatMonthYearFull } from '@/utils/day-utils';
import SalaryComponentFields from '.';

type Props = {
  open: boolean;
  onClose: () => void;
  revision: SalaryPackageDetail | null;
  isEpfEnabled?: boolean;
  isEsiEnabled?: boolean;
};

const SalaryRevisionDetailDrawer: React.FC<Props> = ({
  open,
  onClose,
  revision,
  isEpfEnabled,
  isEsiEnabled,
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { formateCurrency } = useCurrencyFormatter();
  const { getSalaryLabel } = useSalaryLabels();

  const { revisionHistoryEntity: salaryRevisalHistory } = useAppSelector(
    (state) => state.employeeSalary,
  );
  const { entities: salaryComponentList } = useAppSelector((state) => state.salaryComponent);

  const {
    employee,
    totalPay = 0,
    totalPayPrevious = 0,
    designation,
    effectiveFromMonth,
    effectiveFromYear,
    employeeSalaryComponents = [],
  } = salaryRevisalHistory;

  const drawerTitle = useMemo(() => {
    if (!employee) return 'Salary Revision';
    return `Salary Revision for ${employee.employeeNumber || ''} ${employee.name}`;
  }, [employee]);

  const totalPayList = useMemo(() => {
    return [
      {
        label: getSalaryLabel('previousCtc'),
        value: formateCurrency(totalPayPrevious ?? 0),
      },
      {
        label: getSalaryLabel('revisedCtc'),
        value: formateCurrency(totalPay),
      },
      {
        label: 'Difference',
        value: formateCurrency(Number(totalPay) - Number(totalPayPrevious)),
      },
      ...(designation
        ? [
            {
              label: 'Designation',
              value: designation.name,
            },
          ]
        : []),
      {
        label: 'Effective From',
        value: formatMonthYearFull(effectiveFromMonth, effectiveFromYear),
      },
    ];
  }, [
    designation,
    effectiveFromMonth,
    effectiveFromYear,
    totalPay,
    totalPayPrevious,
    formateCurrency,
    getSalaryLabel,
  ]);

  const formattedSalaryComponents = useMemo(() => {
    return employeeSalaryComponents
      .map(({ salaryComponent, ...rest }) => ({
        ...rest,
        ...salaryComponent,
      }))
      .filter((comp) => comp.value != null && comp.value !== '' && Number(comp.value) !== 0);
  }, [employeeSalaryComponents]);

  useEffect(() => {
    if (revision?.id) {
      dispatch(fetchEmployeeSalaryRevisalHistoryById(revision.id));
    }
  }, [dispatch, revision?.id]);

  useEffect(() => {
    if (!salaryComponentList?.length) {
      dispatch(fetchAllSalaryComponents());
    }
  }, [dispatch, salaryComponentList?.length]);

  return (
    <DrawerWithControls
      open={open}
      title={drawerTitle}
      onClose={onClose}
      paperProps={{ sx: { width: '100%', maxWidth: 800 } }}
      filledButtonProps={{ isShow: false }}
      outlineButtonProps={{ isShow: false }}
    >
      <FormSection mt={3}>
        <Grid container justifyContent='space-between' alignItems='center' minHeight={100}>
          {totalPayList.map(({ label, value }, index) => (
            <Box key={index}>
              <Typography color={theme.palette.grey[500]} fontSize='14px' mb={2}>
                {label}
              </Typography>
              <Typography>{value}</Typography>
            </Box>
          ))}
        </Grid>

        <Box mt={4}>
          <SalaryComponentFields
            showCalculationType={false}
            showOtherPayInfo={false}
            showPercentage
            isViewMode
            salaryComponents={formattedSalaryComponents}
            isEpfEnabled={isEpfEnabled}
            isEsiEnabled={isEsiEnabled}
            costToCompany={revision?.totalPay}
            grossSalary={revision?.totalPay}
          />
        </Box>
      </FormSection>
    </DrawerWithControls>
  );
};

export default SalaryRevisionDetailDrawer;
