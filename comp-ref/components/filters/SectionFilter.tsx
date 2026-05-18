'use client';

import React, { useEffect } from 'react';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import {
  clearRootSections,
  fetchRootSectionsByDepartment,
} from '@/redux/master/department-section/department-section.slice';
import { DepartmentSection } from '@/types/master/department-section';

interface SectionFilterProps {
  departmentId?: number;
  value: DepartmentSection | null;
  onChange: (section: DepartmentSection | null) => void;
  onSubSectionChange?: (subSection: DepartmentSection | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable Section Filter component for list screens.
 * Only renders when isDepartmentSectionsEnabled is true for the company.
 * Fetches root sections (parentId = null) for the given department.
 */
const SectionFilter: React.FC<SectionFilterProps> = ({
  departmentId,
  value,
  onChange,
  onSubSectionChange,
  label = 'Section',
  placeholder = 'All Sections',
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const { rootSections = [], rootSectionsLoading } = useAppSelector(
    (state) => state.departmentSection,
  );
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const isDepartmentSectionsEnabled = companyInfo?.isDepartmentSectionsEnabled;

  // Fetch company info if not loaded
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch root sections when department changes
  useEffect(() => {
    if (isDepartmentSectionsEnabled && departmentId) {
      dispatch(fetchRootSectionsByDepartment(departmentId));
    } else {
      dispatch(clearRootSections());
    }
  }, [dispatch, isDepartmentSectionsEnabled, departmentId]);

  // Clear section when department changes
  useEffect(() => {
    if (value !== null) {
      onChange(null);
      onSubSectionChange?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  // Don't render if sections are not enabled
  if (!isDepartmentSectionsEnabled) {
    return null;
  }

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={rootSections || []}
      value={value ?? undefined}
      getOptionLabel={(option: DepartmentSection) => option.name}
      onChange={(newValue) => {
        onChange(newValue as DepartmentSection | null);
        onSubSectionChange?.(null); // Clear sub-section when section changes
      }}
      isClearable
      isDisabled={disabled || !departmentId || rootSectionsLoading}
    />
  );
};

export default SectionFilter;
