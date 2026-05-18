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
import { fetchAllBusinessVerticals } from '@/redux/master/business-vertical/business-vertical.slice';
import { BusinessVertical } from '@/types/division-branch';

interface BusinessVerticalFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  setValue?: UseFormSetValue<T>;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  entityBusinessVertical?: BusinessVertical | null;
  isEditMode?: boolean;
}

/**
 * Reusable Business Vertical form field component for master add/edit forms.
 * Only renders when hasMultiBranchEnabled is true for the company.
 */
function BusinessVerticalFormField<T extends FieldValues>({
  control,
  name,
  setValue,
  label = 'Business Vertical',
  isRequired = true,
  disabled = false,
  entityBusinessVertical,
  isEditMode = false,
}: BusinessVerticalFormFieldProps<T>) {
  const dispatch = useAppDispatch();
  const { allEntities: businessVerticals = [] } = useAppSelector((state) => state.businessVertical);
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  useEffect(() => {
    if (hasMultiBranchEnabled && (businessVerticals?.length || 0) === 0) {
      dispatch(fetchAllBusinessVerticals());
    }
  }, [dispatch, hasMultiBranchEnabled, businessVerticals?.length]);

  const defaultBusinessVertical = useMemo(() => {
    if (isEditMode && entityBusinessVertical) {
      return entityBusinessVertical;
    }
    return null;
  }, [isEditMode, entityBusinessVertical]);

  // Set default value when business verticals are loaded (for edit mode)
  useEffect(() => {
    if (isEditMode && defaultBusinessVertical && setValue) {
      setValue(name, defaultBusinessVertical as PathValue<T, Path<T>>);
    }
  }, [defaultBusinessVertical, isEditMode, name, setValue]);

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
          placeholder='Select Business Vertical'
          options={businessVerticals || []}
          value={value || defaultBusinessVertical || undefined}
          getOptionLabel={(option: BusinessVertical) => option?.name || ''}
          onChange={onChange}
          isDisabled={disabled}
          error={Boolean(error?.message)}
          helperText={error?.message}
          isRequired={isRequired}
          isClearable
        />
      )}
    />
  );
}

export default BusinessVerticalFormField;
