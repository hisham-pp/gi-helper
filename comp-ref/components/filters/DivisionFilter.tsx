'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { UNASSIGNED_FILTER_ID, UNASSIGNED_FILTER_LABEL } from '@/constant/status';
import { AppSelect } from '@/core/components/app-select';
import useAuth from '@/hooks/use-auth';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { fetchAllDivisions } from '@/redux/master/division/division.slice';
import { defaultDivision, Division } from '@/types/division-branch';

interface DivisionFilterProps {
  value: Division | null;
  onChange: (division: Division | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** When true, syncs with global division filter from header (default: true) */
  syncWithGlobal?: boolean;
  /** When true, only returns divisions accessible to the current user based on access scope */
  scopeBased?: boolean;
  /** When true, preselects the logged-in user's working division on mount */
  preselectUserDivision?: boolean;
  /** When true, shows required indicator on the label */
  isRequired?: boolean;
  /** Filter divisions by business vertical */
  businessVerticalId?: number;
  /** When true, prepends a synthetic "Not Assigned" option (id = -1) for filtering employees with no division */
  includeUnassigned?: boolean;
}

/**
 * Reusable Division Filter component for master list screens.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Fetches divisions on mount and provides a dropdown to filter by division.
 * When syncWithGlobal is true (default), auto-selects from global filter.
 */
const DivisionFilter: React.FC<DivisionFilterProps> = ({
  value,
  onChange,
  label = 'Division',
  placeholder = 'All Divisions',
  disabled = false,
  syncWithGlobal = true,
  scopeBased = false,
  preselectUserDivision = false,
  isRequired = false,
  businessVerticalId,
  includeUnassigned = false,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { globalFilter } = useAppSelector((state) => state.divisionBranchContext);

  // Track if we've synced on mount to avoid infinite loops
  const hasSyncedRef = useRef(false);
  const prevGlobalDivisionIdRef = useRef<number | null>(null);
  // Track which company we've fetched divisions for
  const fetchedForCompanyRef = useRef<number | null>(null);

  // Only show if multi-branch is enabled
  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Fetch company info if not loaded (needed for hasMultiBranchEnabled check)
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch divisions when company changes or on initial load
  useEffect(() => {
    if (hasMultiBranchEnabled && companyInfo?.id) {
      // Only fetch if we haven't fetched for this company yet
      if (fetchedForCompanyRef.current !== companyInfo.id) {
        fetchedForCompanyRef.current = companyInfo.id;
        dispatch(fetchAllDivisions(scopeBased ? { scopeBased: true } : undefined));
      }
    }
  }, [dispatch, hasMultiBranchEnabled, companyInfo?.id]);

  // Sync with global filter when enabled
  useEffect(() => {
    if (!syncWithGlobal || !hasMultiBranchEnabled || divisions.length === 0) {
      return;
    }

    const globalDivisionId = globalFilter.divisionId;

    // Check if global filter changed (not just on mount)
    const globalChanged = prevGlobalDivisionIdRef.current !== globalDivisionId;
    prevGlobalDivisionIdRef.current = globalDivisionId;

    // Sync on mount or when global filter changes
    if (!hasSyncedRef.current || globalChanged) {
      hasSyncedRef.current = true;

      if (globalDivisionId) {
        const globalDivision = divisions.find((d) => d.id === globalDivisionId);
        if (globalDivision && value?.id !== globalDivisionId) {
          onChange(globalDivision);
        }
      } else if (globalChanged && value !== null) {
        // Global filter cleared, clear local filter too
        onChange(null);
      }
    }
  }, [syncWithGlobal, hasMultiBranchEnabled, divisions, globalFilter.divisionId, value, onChange]);

  // Preselect user's working division on mount (only if global division filter isn't set)
  const hasPreselectedRef = useRef(false);
  useEffect(() => {
    if (
      preselectUserDivision &&
      !hasPreselectedRef.current &&
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
      if (userDivision) {
        onChange(userDivision);
      }
    }
  }, [
    preselectUserDivision,
    divisions,
    value,
    syncWithGlobal,
    globalFilter.businessVerticalId,
    globalFilter.divisionId,
    globalFilter.branchId,
    user?.sponsorDivisionId,
    onChange,
  ]);

  // Filter divisions by business vertical if provided, then optionally append "Not Assigned"
  const filteredDivisions = useMemo(() => {
    const filtered =
      businessVerticalId && businessVerticalId !== UNASSIGNED_FILTER_ID
        ? divisions.filter((d) => d.businessVerticalId === businessVerticalId)
        : divisions;
    if (!includeUnassigned) return filtered;
    const unassigned: Division = {
      ...defaultDivision,
      id: UNASSIGNED_FILTER_ID,
      name: UNASSIGNED_FILTER_LABEL,
    };
    return [...filtered, unassigned];
  }, [divisions, businessVerticalId, includeUnassigned]);

  // Clear selected division when businessVerticalId changes (but not on initial mount)
  const prevBusinessVerticalIdRef = useRef(businessVerticalId);
  const isInitialBVChangeRef = useRef(true);
  useEffect(() => {
    if (prevBusinessVerticalIdRef.current !== businessVerticalId) {
      prevBusinessVerticalIdRef.current = businessVerticalId;
      // Skip clearing on the first BV change (initial pre-selection from parent)
      if (isInitialBVChangeRef.current) {
        isInitialBVChangeRef.current = false;
        return;
      }
      // Don't clear if value matches global filter (sync in progress from page navigation)
      if (value && !(syncWithGlobal && globalFilter.divisionId === value.id)) {
        onChange(null);
      }
    }
  }, [businessVerticalId, value, onChange, syncWithGlobal, globalFilter.divisionId]);

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={filteredDivisions || []}
      value={value || null}
      getOptionLabel={(option: Division) => {
        return option?.name || '';
      }}
      onChange={(newValue) => onChange(newValue as Division | null)}
      isClearable={!isRequired}
      isDisabled={disabled}
      isRequired={isRequired}
      formControlProps={{ sx: { minWidth: { xs: 180, sm: 220 } } }}
    />
  );
};

export default DivisionFilter;
