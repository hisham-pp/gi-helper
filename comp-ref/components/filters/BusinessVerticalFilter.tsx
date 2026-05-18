'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { UNASSIGNED_FILTER_ID, UNASSIGNED_FILTER_LABEL } from '@/constant/status';
import { AppSelect } from '@/core/components/app-select';
import useAuth from '@/hooks/use-auth';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllBusinessVerticals } from '@/redux/master/business-vertical/business-vertical.slice';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { BusinessVertical, defaultBusinessVertical } from '@/types/division-branch';

interface BusinessVerticalFilterProps {
  value: BusinessVertical | null;
  onChange: (businessVertical: BusinessVertical | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** When true, syncs with global business vertical filter from header (default: true) */
  syncWithGlobal?: boolean;
  /** When true, only returns verticals accessible to the current user based on access scope */
  scopeBased?: boolean;
  /** When true, preselects the logged-in user's business vertical on mount */
  preselectUserVertical?: boolean;
  /** When true, the field shows required indicator */
  isRequired?: boolean;
  /** When true, prepends a synthetic "Not Assigned" option (id = -1) for filtering employees with no business vertical */
  includeUnassigned?: boolean;
}

/**
 * Reusable Business Vertical Filter component.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Fetches business verticals on mount and provides a dropdown to filter by vertical.
 */
const BusinessVerticalFilter: React.FC<BusinessVerticalFilterProps> = ({
  value,
  onChange,
  label = 'Business Vertical',
  placeholder = 'All Verticals',
  disabled = false,
  syncWithGlobal = true,
  scopeBased = false,
  preselectUserVertical = false,
  isRequired = false,
  includeUnassigned = false,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { allEntities: businessVerticals = [] } = useAppSelector((state) => state.businessVertical);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { globalFilter } = useAppSelector((state) => state.divisionBranchContext);

  // Track if we've synced on mount to avoid infinite loops
  const hasSyncedRef = useRef(false);
  const prevGlobalBVIdRef = useRef<number | null>(null);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Fetch company info if not loaded
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch business verticals on mount
  useEffect(() => {
    if (hasMultiBranchEnabled) {
      dispatch(fetchAllBusinessVerticals(scopeBased ? { scopeBased: true } : undefined));
    }
  }, [dispatch, hasMultiBranchEnabled, scopeBased]);

  // Sync with global filter when enabled
  useEffect(() => {
    if (!syncWithGlobal || !hasMultiBranchEnabled || businessVerticals.length === 0) {
      return;
    }

    const globalBVId = globalFilter.businessVerticalId;

    // Check if global filter changed (not just on mount)
    const globalChanged = prevGlobalBVIdRef.current !== globalBVId;
    prevGlobalBVIdRef.current = globalBVId;

    // Sync on mount or when global filter changes
    if (!hasSyncedRef.current || globalChanged) {
      hasSyncedRef.current = true;

      if (globalBVId) {
        const globalBV = businessVerticals.find((bv) => bv.id === globalBVId);
        if (globalBV && value?.id !== globalBVId) {
          onChange(globalBV);
        }
      } else if (globalChanged && value !== null) {
        // Global filter cleared, clear local filter too
        onChange(null);
      }
    }
  }, [
    syncWithGlobal,
    hasMultiBranchEnabled,
    businessVerticals,
    globalFilter.businessVerticalId,
    value,
    onChange,
  ]);

  // Preselect user's business vertical on mount (derived from user's sponsor division)
  const hasPreselectedRef = useRef(false);
  useEffect(() => {
    if (
      preselectUserVertical &&
      !hasPreselectedRef.current &&
      businessVerticals.length > 0 &&
      divisions.length > 0 &&
      !value &&
      !(
        syncWithGlobal &&
        (globalFilter.businessVerticalId || globalFilter.divisionId || globalFilter.branchId)
      ) &&
      user?.sponsorDivisionId
    ) {
      hasPreselectedRef.current = true;
      const userDivision = divisions.find((d) => d.id === user.sponsorDivisionId);
      if (userDivision?.businessVerticalId) {
        const userBV = businessVerticals.find((bv) => bv.id === userDivision.businessVerticalId);
        if (userBV) {
          onChange(userBV);
        }
      }
    }
  }, [
    preselectUserVertical,
    businessVerticals,
    divisions,
    value,
    globalFilter.businessVerticalId,
    user?.sponsorDivisionId,
    onChange,
  ]);

  const optionsWithUnassigned = useMemo(() => {
    if (!includeUnassigned) return businessVerticals || [];
    const unassigned: BusinessVertical = {
      ...defaultBusinessVertical,
      id: UNASSIGNED_FILTER_ID,
      name: UNASSIGNED_FILTER_LABEL,
    };
    return [...(businessVerticals || []), unassigned];
  }, [businessVerticals, includeUnassigned]);

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={optionsWithUnassigned}
      value={value || null}
      getOptionLabel={(option: BusinessVertical) => option?.name || ''}
      onChange={(newValue) => onChange(newValue as BusinessVertical | null)}
      isClearable={!isRequired}
      isDisabled={disabled}
      isRequired={isRequired}
      formControlProps={{ sx: { minWidth: { xs: 180, sm: 220 } } }}
    />
  );
};

export default BusinessVerticalFilter;
