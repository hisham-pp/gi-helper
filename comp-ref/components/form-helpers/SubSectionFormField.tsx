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
  clearChildSections,
  fetchChildSections,
  fetchChildSectionsForMultiple,
} from '@/redux/master/department-section/department-section.slice';
import { DepartmentSection } from '@/types/master/department-section';

interface SubSectionFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  setValue?: UseFormSetValue<T>;
  sectionId?: number;
  sectionIds?: number[];
  label?: string;
  isRequired?: boolean;
  disabled?: boolean;
  isMulti?: boolean;
  /** Subsections mapped to the selected designation - these will appear first in the list */
  designationSubsections?: DepartmentSection[];
}

/**
 * Reusable Sub-Section form field component for forms.
 * Only renders when isDepartmentSubSectionsEnabled is true for the company.
 * Fetches child sections for the given parent section(s).
 * Supports both single and multi-select modes.
 */
function SubSectionFormField<T extends FieldValues>({
  control,
  name,
  setValue,
  sectionId,
  sectionIds = [],
  label = 'Sub-Section',
  isRequired = false,
  disabled = false,
  isMulti = false,
  designationSubsections,
}: SubSectionFormFieldProps<T>) {
  const dispatch = useAppDispatch();
  const { childSections = [], childSectionsLoading } = useAppSelector(
    (state) => state.departmentSection,
  );
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const isDepartmentSubSectionsEnabled = companyInfo?.isDepartmentSubSectionsEnabled;

  // Track previous sectionIds to detect actual changes vs initial load
  const prevSectionIds = useRef<number[]>([]);

  // Determine effective section IDs (support both single and multiple)
  const effectiveSectionIds = sectionIds.length > 0 ? sectionIds : sectionId ? [sectionId] : [];

  useEffect(() => {
    if (isDepartmentSubSectionsEnabled && effectiveSectionIds.length > 0) {
      if (effectiveSectionIds.length === 1) {
        dispatch(fetchChildSections(effectiveSectionIds[0]));
      } else {
        dispatch(fetchChildSectionsForMultiple(effectiveSectionIds));
      }
    } else {
      dispatch(clearChildSections());
    }
  }, [dispatch, isDepartmentSubSectionsEnabled, JSON.stringify(effectiveSectionIds)]);

  // Clear field only when sections actually change (user action, not initial load)
  useEffect(() => {
    const hadPreviousValue = prevSectionIds.current.length > 0;
    const valueChanged =
      JSON.stringify(prevSectionIds.current) !== JSON.stringify(effectiveSectionIds);

    if (hadPreviousValue && valueChanged && isDepartmentSubSectionsEnabled && setValue) {
      setValue(name, (isMulti ? [] : null) as PathValue<T, Path<T>>);
    }
    prevSectionIds.current = effectiveSectionIds;
  }, [
    JSON.stringify(effectiveSectionIds),
    isDepartmentSubSectionsEnabled,
    isMulti,
    name,
    setValue,
  ]);

  // Sort subsections: designation-mapped subsections first, then others
  const sortedSubsections = useMemo(() => {
    if (!childSections?.length) return [];
    if (!designationSubsections?.length) return childSections;

    const designationSubsectionIds = new Set(designationSubsections.map((s) => s.id));

    // Separate into designation subsections and other subsections
    const mappedSubsections = childSections.filter((s) => designationSubsectionIds.has(s.id));
    const otherSubsections = childSections.filter((s) => !designationSubsectionIds.has(s.id));

    return [...mappedSubsections, ...otherSubsections];
  }, [childSections, designationSubsections]);

  // Custom label to mark designation-mapped subsections
  const getOptionLabel = useMemo(() => {
    if (!designationSubsections?.length) {
      return (option: DepartmentSection) => option.name;
    }

    const designationSubsectionIds = new Set(designationSubsections.map((s) => s.id));
    return (option: DepartmentSection) => {
      if (designationSubsectionIds.has(option.id)) {
        return `${option.name} (Default)`;
      }
      return option.name;
    };
  }, [designationSubsections]);

  // Don't render if sub-sections are not enabled
  if (!isDepartmentSubSectionsEnabled) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <AppSelect
          label={label}
          placeholder={isMulti ? 'Select Sub-Sections' : 'Select Sub-Section'}
          options={sortedSubsections}
          value={value || (isMulti ? [] : undefined)}
          getOptionLabel={getOptionLabel}
          onChange={onChange}
          isDisabled={disabled || effectiveSectionIds.length === 0 || childSectionsLoading}
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

export default SubSectionFormField;
