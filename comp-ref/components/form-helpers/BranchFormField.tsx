'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllBranches } from '@/redux/master/branch/branch.slice';
import { Branch } from '@/types/division-branch';

interface BranchFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  setValue?: UseFormSetValue<T>;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  entityBranch?: Branch | null;
  isEditMode?: boolean;
  showCompanyWideOption?: boolean;
  isClearable?: boolean;
}

const COMPANY_WIDE_OPTION = {
  id: null,
  name: 'Company Wide',
  code: 'ALL',
} as unknown as Branch;

/**
 * Reusable Branch form field component for pay cycle and related forms.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Auto-selects user's current context branch for new records.
 * Optionally shows "Company Wide" option for global pay cycles.
 */
function BranchFormField<T extends FieldValues>({
  control,
  name,
  setValue,
  label = 'Branch',
  isRequired = false,
  disabled = false,
  entityBranch,
  isEditMode = false,
  showCompanyWideOption = true,
  isClearable = true,
}: BranchFormFieldProps<T>) {
  const dispatch = useAppDispatch();
  const { allEntities: branches = [] } = useAppSelector((state) => state.branch);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { currentContext } = useAppSelector((state) => state.divisionBranchContext);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  useEffect(() => {
    if (hasMultiBranchEnabled && (branches?.length || 0) === 0) {
      dispatch(fetchAllBranches(undefined));
    }
  }, [dispatch, hasMultiBranchEnabled, branches?.length]);

  // Build options list with optional "Company Wide" option
  const options = useMemo(() => {
    if (showCompanyWideOption) {
      return [COMPANY_WIDE_OPTION, ...(branches || [])];
    }
    return branches || [];
  }, [branches, showCompanyWideOption]);

  // Auto-select user's current context branch for new records
  const defaultBranch = useMemo(() => {
    if (isEditMode && entityBranch) {
      return entityBranch;
    }
    if (!isEditMode && currentContext.branchId && (branches?.length || 0) > 0) {
      return branches?.find((b) => b.id === currentContext.branchId) || null;
    }
    return null;
  }, [isEditMode, entityBranch, currentContext.branchId, branches]);

  // Set default value when branches are loaded (for new records)
  useEffect(() => {
    if (!isEditMode && defaultBranch && setValue) {
      setValue(name, defaultBranch as PathValue<T, Path<T>>);
    }
  }, [defaultBranch, isEditMode, name, setValue]);

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <AppSelect
          label={label}
          placeholder='Select Branch (or leave empty for Company Wide)'
          options={options}
          value={value || defaultBranch || undefined}
          getOptionLabel={(option: Branch) =>
            option.id === null ? option.name : `${option.code} - ${option.name}`
          }
          onChange={onChange}
          isDisabled={disabled}
          error={Boolean(error?.message)}
          helperText={error?.message}
          isRequired={isRequired}
          isClearable={isClearable}
        />
      )}
    />
  );
}

export default BranchFormField;
