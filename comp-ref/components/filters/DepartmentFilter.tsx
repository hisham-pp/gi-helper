'use client';

import React, { useEffect, useMemo } from 'react';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllDepartments } from '@/redux/master/department/department.slice';
import { Department } from '@/types/master/department';

interface DepartmentFilterProps {
  value: Department | null;
  onChange: (department: Department | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  divisionId?: number;
  businessVerticalId?: number;
  /** When true, only returns departments accessible to the current user based on access scope */
  scopeBased?: boolean;
  onSectionChange?: (section: null) => void;
  onSubSectionChange?: (subSection: null) => void;
}

/**
 * Reusable Department Filter component for list screens.
 * Fetches departments on mount and provides a dropdown to filter by department.
 * Supports optional division filtering for multi-branch setups.
 * Shows "Division - Department" format when no division is selected.
 */
const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  value,
  onChange,
  label = 'Department',
  placeholder = 'All Departments',
  disabled = false,
  divisionId,
  businessVerticalId,
  scopeBased = false,
  onSectionChange,
  onSubSectionChange,
}) => {
  const dispatch = useAppDispatch();
  const { allEntities: departments = [] } = useAppSelector((state) => state.department);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Fetch departments on mount
  useEffect(() => {
    dispatch(fetchAllDepartments(scopeBased ? { scopeBased: true } : undefined));
  }, [dispatch, scopeBased]);

  // Resolve divisionId → businessVerticalId for cascading filter
  const effectiveBusinessVerticalId = useMemo(() => {
    if (businessVerticalId) return businessVerticalId;
    if (divisionId && divisions.length > 0) {
      const division = divisions.find((d) => d.id === divisionId);
      return division?.businessVerticalId;
    }
    return undefined;
  }, [businessVerticalId, divisionId, divisions]);

  // Filter departments by resolved businessVerticalId (cascading from vertical or division)
  const filteredDepartments = useMemo(() => {
    if (!effectiveBusinessVerticalId) return departments;
    return departments.filter((d) => d.businessVerticalId === effectiveBusinessVerticalId);
  }, [departments, effectiveBusinessVerticalId]);

  // Clear department when parent filter changes
  useEffect(() => {
    if (value !== null) {
      onChange(null);
      onSectionChange?.(null);
      onSubSectionChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionId, businessVerticalId, effectiveBusinessVerticalId]);

  // Format department label: "Division - Department" when no division filter and multi-branch enabled
  const getOptionLabel = useMemo(() => {
    return (option: Department) => {
      if (hasMultiBranchEnabled && !divisionId && option.division?.name) {
        return `${option.division.name} - ${option.name}`;
      }
      return option.name;
    };
  }, [hasMultiBranchEnabled, divisionId]);

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={filteredDepartments || []}
      value={value || null}
      getOptionLabel={getOptionLabel}
      onChange={(newValue) => {
        onChange(newValue as Department | null);
        onSectionChange?.(null);
        onSubSectionChange?.(null);
      }}
      isClearable
      isDisabled={disabled}
      formControlProps={{ sx: { minWidth: { xs: 180, sm: 220 } } }}
    />
  );
};

export default DepartmentFilter;
