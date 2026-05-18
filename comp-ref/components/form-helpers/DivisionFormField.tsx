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
import { fetchAllDivisions } from '@/redux/master/division/division.slice';
import { Division } from '@/types/division-branch';

interface DivisionFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  setValue?: UseFormSetValue<T>;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  entityDivision?: Division | null;
  isEditMode?: boolean;
}

/**
 * Reusable Division form field component for master add/edit forms.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Auto-selects user's current context division for new records.
 */
function DivisionFormField<T extends FieldValues>({
  control,
  name,
  setValue,
  label = 'Division',
  isRequired = true,
  disabled = false,
  entityDivision,
  isEditMode = false,
}: DivisionFormFieldProps<T>) {
  const dispatch = useAppDispatch();
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { currentContext } = useAppSelector((state) => state.divisionBranchContext);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  useEffect(() => {
    if (hasMultiBranchEnabled && (divisions?.length || 0) === 0) {
      dispatch(fetchAllDivisions());
    }
  }, [dispatch, hasMultiBranchEnabled, divisions?.length]);

  // Auto-select user's current context division for new records
  const defaultDivision = useMemo(() => {
    if (isEditMode && entityDivision) {
      return entityDivision;
    }
    if (!isEditMode && currentContext.divisionId && (divisions?.length || 0) > 0) {
      return divisions?.find((d) => d.id === currentContext.divisionId) || null;
    }
    return null;
  }, [isEditMode, entityDivision, currentContext.divisionId, divisions]);

  // Set default value when divisions are loaded (for new records)
  useEffect(() => {
    if (!isEditMode && defaultDivision && setValue) {
      setValue(name, defaultDivision as PathValue<T, Path<T>>);
    }
  }, [defaultDivision, isEditMode, name, setValue]);

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
          placeholder='Select Division'
          options={divisions || []}
          value={value || defaultDivision || undefined}
          getOptionLabel={(option: Division) => `${option.code} - ${option.name}`}
          onChange={onChange}
          isDisabled={disabled}
          error={Boolean(error?.message)}
          helperText={error?.message}
          isRequired={isRequired}
        />
      )}
    />
  );
}

export default DivisionFormField;
