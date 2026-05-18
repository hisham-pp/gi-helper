'use client';

import React, { useEffect, useMemo, useRef } from 'react';
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
import {
  clearRootSections,
  fetchRootSectionsByDepartment,
} from '@/redux/master/department-section/department-section.slice';
import { DepartmentSection } from '@/types/master/department-section';

interface SectionFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  setValue?: UseFormSetValue<T>;
  departmentId?: number;
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  isMulti?: boolean;
  onChangeCallback?: (sections: DepartmentSection[] | DepartmentSection | null) => void;
  /** Sections mapped to the selected designation - these will appear first in the list */
  designationSections?: DepartmentSection[];
}

/**
 * Reusable Section form field component for forms.
 * Only renders when isDepartmentSectionsEnabled is true for the company.
 * Fetches root sections (sections without parent) for the given department.
 * Supports both single and multi-select modes.
 */
function SectionFormField<T extends FieldValues>({
  control,
  name,
  setValue,
  departmentId,
  label = 'Section',
  isRequired = false,
  disabled = false,
  isMulti = false,
  onChangeCallback,
  designationSections,
}: SectionFormFieldProps<T>) {
  const dispatch = useAppDispatch();
  const { rootSections = [], rootSectionsLoading } = useAppSelector(
    (state) => state.departmentSection,
  );
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const isDepartmentSectionsEnabled = companyInfo?.isDepartmentSectionsEnabled;

  // Track previous departmentId to detect actual changes vs initial load
  const prevDepartmentId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isDepartmentSectionsEnabled && departmentId) {
      dispatch(fetchRootSectionsByDepartment(departmentId));
    } else {
      dispatch(clearRootSections());
    }
  }, [dispatch, isDepartmentSectionsEnabled, departmentId]);

  // Clear field only when department actually changes (user action, not initial load)
  useEffect(() => {
    // Only clear if:
    // 1. Previous departmentId was a real value (not undefined/null)
    // 2. AND it changed to a different value
    // This prevents clearing on initial form load when departmentId goes from undefined to actual value
    const hadPreviousValue =
      prevDepartmentId.current !== undefined && prevDepartmentId.current !== null;
    const valueChanged = prevDepartmentId.current !== departmentId;

    if (hadPreviousValue && valueChanged && isDepartmentSectionsEnabled && setValue) {
      setValue(name, (isMulti ? [] : null) as PathValue<T, Path<T>>);
    }
    prevDepartmentId.current = departmentId;
  }, [departmentId, isDepartmentSectionsEnabled, isMulti, name, setValue]);

  // Sort sections: designation-mapped sections first, then others
  const sortedSections = useMemo(() => {
    if (!rootSections?.length) return [];
    if (!designationSections?.length) return rootSections;

    const designationSectionIds = new Set(designationSections.map((s) => s.id));

    // Separate into designation sections and other sections
    const mappedSections = rootSections.filter((s) => designationSectionIds.has(s.id));
    const otherSections = rootSections.filter((s) => !designationSectionIds.has(s.id));

    return [...mappedSections, ...otherSections];
  }, [rootSections, designationSections]);

  // Custom label to mark designation-mapped sections
  const getOptionLabel = useMemo(() => {
    if (!designationSections?.length) {
      return (option: DepartmentSection) => option.name;
    }

    const designationSectionIds = new Set(designationSections.map((s) => s.id));
    return (option: DepartmentSection) => {
      if (designationSectionIds.has(option.id)) {
        return `${option.name} (Default)`;
      }
      return option.name;
    };
  }, [designationSections]);

  // Don't render if sections are not enabled
  if (!isDepartmentSectionsEnabled) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <AppSelect
          label={label}
          placeholder={isMulti ? 'Select Sections' : 'Select Section'}
          options={sortedSections}
          value={value || (isMulti ? [] : undefined)}
          getOptionLabel={getOptionLabel}
          onChange={(newValue) => {
            onChange(newValue);
            onChangeCallback?.(newValue);
          }}
          isDisabled={disabled || !departmentId || rootSectionsLoading}
          error={Boolean(error?.message)}
          helperText={error?.message}
          isRequired={isRequired}
          isClearable
          isMulti={isMulti}
        />
      )}
    />
  );
}

export default SectionFormField;
