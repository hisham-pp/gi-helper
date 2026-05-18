'use client';

import React, { useEffect } from 'react';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import {
  clearChildSections,
  fetchChildSections,
} from '@/redux/master/department-section/department-section.slice';
import { DepartmentSection } from '@/types/master/department-section';

interface SubSectionFilterProps {
  sectionId?: number;
  value: DepartmentSection | null;
  onChange: (subSection: DepartmentSection | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable Sub-Section Filter component for list screens.
 * Only renders when isDepartmentSubSectionsEnabled is true for the company.
 * Fetches child sections for the given parent section.
 */
const SubSectionFilter: React.FC<SubSectionFilterProps> = ({
  sectionId,
  value,
  onChange,
  label = 'Sub-Section',
  placeholder = 'All Sub-Sections',
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const { childSections = [], childSectionsLoading } = useAppSelector(
    (state) => state.departmentSection,
  );
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const isDepartmentSubSectionsEnabled = companyInfo?.isDepartmentSubSectionsEnabled;

  // Fetch company info if not loaded
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch child sections when section changes
  useEffect(() => {
    if (isDepartmentSubSectionsEnabled && sectionId) {
      dispatch(fetchChildSections(sectionId));
    } else {
      dispatch(clearChildSections());
    }
  }, [dispatch, isDepartmentSubSectionsEnabled, sectionId]);

  // Clear sub-section when section changes
  useEffect(() => {
    if (value !== null) {
      onChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  // Don't render if sub-sections are not enabled
  if (!isDepartmentSubSectionsEnabled) {
    return null;
  }

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={childSections || []}
      value={value ?? undefined}
      getOptionLabel={(option: DepartmentSection) => option.name}
      onChange={(newValue) => onChange(newValue as DepartmentSection | null)}
      isClearable
      isDisabled={disabled || !sectionId || childSectionsLoading}
    />
  );
};

export default SubSectionFilter;
