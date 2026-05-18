'use client';

import React, { useEffect } from 'react';
import AppAutocomplete from '@/core/components/app-autocomplete';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllEmployees } from '@/redux/employee/employee.slice';
import { Employee } from '@/types/employee';

interface EmployeeHeadSelectProps {
  value: number | null | undefined;
  onChange: (employeeId: number | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const EmployeeHeadSelect: React.FC<EmployeeHeadSelectProps> = ({
  value,
  onChange,
  label = 'Head',
  placeholder = 'Select Employee',
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const { allEntities: employees = [] } = useAppSelector((state) => state.employee);

  useEffect(() => {
    if (!employees.length) {
      dispatch(fetchAllEmployees({}));
    }
  }, [dispatch, employees.length]);

  const selectedEmployee = employees.find((e: Employee) => e.id === value) || null;

  return (
    <AppAutocomplete
      label={label}
      placeholder={placeholder}
      options={employees || []}
      value={selectedEmployee}
      getOptionLabel={(option: Employee) => {
        const name = option?.name || '';
        const empNum = option?.employeeNumber;
        const bvName = option?.businessVertical?.name;
        const label = empNum ? `${name} (${empNum})` : name;
        return bvName ? `${label} - ${bvName}` : label;
      }}
      isOptionEqualToValue={(option: Employee, val: Employee) => option?.id === val?.id}
      onChange={(_, newValue) => onChange((newValue as Employee)?.id ?? null)}
      disabled={disabled}
      fullWidth
    />
  );
};

export default EmployeeHeadSelect;
