'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { UNASSIGNED_FILTER_ID, UNASSIGNED_FILTER_LABEL } from '@/constant/status';
import { AppSelect } from '@/core/components/app-select';
import useAuth from '@/hooks/use-auth';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllBranches } from '@/redux/master/branch/branch.slice';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { Branch, defaultBranch } from '@/types/division-branch';

interface BranchFilterProps {
  value: Branch | null;
  onChange: (branch: Branch | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  divisionId?: number;
  businessVerticalId?: number;
  /** When true, syncs with global branch filter from header (default: true) */
  syncWithGlobal?: boolean;
  /** When true, only returns branches accessible to the current user based on access scope */
  scopeBased?: boolean;
  /** When true, preselects the logged-in user's working branch on mount */
  preselectUserBranch?: boolean;
  /** When true, prepends a synthetic "Not Assigned" option (id = -1) for filtering employees with no working branch */
  includeUnassigned?: boolean;
}

/**
 * Reusable Branch Filter component for pay cycle/pay run list screens.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Fetches branches on mount and provides a dropdown to filter by branch.
 * When syncWithGlobal is true (default), auto-selects from global filter.
 */
const BranchFilter: React.FC<BranchFilterProps> = ({
  value,
  onChange,
  label = 'Branch',
  placeholder = 'All Branches',
  disabled = false,
  divisionId,
  businessVerticalId,
  syncWithGlobal = true,
  scopeBased = false,
  preselectUserBranch = false,
  includeUnassigned = false,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { allEntities: branches = [] } = useAppSelector((state) => state.branch);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { globalFilter } = useAppSelector((state) => state.divisionBranchContext);

  // Track if we've synced on mount to avoid infinite loops
  const hasSyncedRef = useRef(false);
  const prevGlobalBranchIdRef = useRef<number | null>(null);
  // Track which company we've fetched branches for
  const fetchedForCompanyRef = useRef<number | null>(null);

  // Only show if multi-branch is enabled
  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Fetch company info if not loaded (needed for hasMultiBranchEnabled check)
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch branches when company changes or on initial load
  useEffect(() => {
    if (hasMultiBranchEnabled && companyInfo?.id) {
      // Only fetch if we haven't fetched for this company yet
      if (fetchedForCompanyRef.current !== companyInfo.id) {
        fetchedForCompanyRef.current = companyInfo.id;
        dispatch(fetchAllBranches(scopeBased ? { scopeBased: true } : undefined));
      }
    }
  }, [dispatch, hasMultiBranchEnabled, companyInfo?.id]);

  const filteredBranches = useMemo(() => {
    let filtered = branches;

    // When BV/division filter is "Not Assigned", we shouldn't narrow by id —
    // those parent filters are looking for null relations, which don't constrain branches here.
    const effectiveBVId =
      businessVerticalId === UNASSIGNED_FILTER_ID ? undefined : businessVerticalId;
    const effectiveDivisionId = divisionId === UNASSIGNED_FILTER_ID ? undefined : divisionId;

    if (effectiveBVId && !effectiveDivisionId) {
      filtered = filtered.filter((branch) => {
        const branchBVId = branch.businessVerticalId ?? branch.businessVertical?.id;
        const branchDivisionBVId =
          branch.division?.businessVerticalId ??
          divisions.find((d) => d.id === (branch.divisionId ?? branch.division?.id))
            ?.businessVerticalId;

        return branchBVId === effectiveBVId || branchDivisionBVId === effectiveBVId;
      });
    }

    if (effectiveDivisionId) {
      filtered = filtered.filter((branch) => {
        const directDivisionMatch = branch.divisionId === effectiveDivisionId;
        const nestedDivisionMatch = branch.division?.id === effectiveDivisionId;

        return directDivisionMatch || nestedDivisionMatch;
      });
    }

    if (!includeUnassigned) return filtered;
    const unassigned: Branch = {
      ...defaultBranch,
      id: UNASSIGNED_FILTER_ID,
      name: UNASSIGNED_FILTER_LABEL,
    };
    return [...filtered, unassigned];
  }, [branches, divisions, businessVerticalId, divisionId, includeUnassigned]);

  // Clear selected branch when divisionId changes (but not on initial mount)
  const prevDivisionIdRef = useRef(divisionId);
  const isInitialDivisionChangeRef = useRef(true);
  useEffect(() => {
    if (prevDivisionIdRef.current !== divisionId) {
      prevDivisionIdRef.current = divisionId;
      // Skip clearing on the first division change (initial pre-selection from parent)
      if (isInitialDivisionChangeRef.current) {
        isInitialDivisionChangeRef.current = false;
        return;
      }
      // Don't clear if value matches global filter (sync in progress from page navigation)
      if (value && !(syncWithGlobal && globalFilter.branchId === value.id)) {
        onChange(null);
      }
    }
  }, [divisionId, value, onChange, syncWithGlobal, globalFilter.branchId]);

  // Sync with global filter when enabled
  useEffect(() => {
    if (!syncWithGlobal || !hasMultiBranchEnabled || branches.length === 0) {
      return;
    }

    const globalBranchId = globalFilter.branchId;

    // Check if global filter changed (not just on mount)
    const globalChanged = prevGlobalBranchIdRef.current !== globalBranchId;
    prevGlobalBranchIdRef.current = globalBranchId;

    // Sync on mount or when global filter changes
    if (!hasSyncedRef.current || globalChanged) {
      hasSyncedRef.current = true;

      if (globalBranchId) {
        // Find the branch in filtered list (respects division constraint)
        const globalBranch = filteredBranches.find((b) => b.id === globalBranchId);
        if (globalBranch && value?.id !== globalBranchId) {
          onChange(globalBranch);
        } else if (!globalBranch && value !== null) {
          // Global branch not in filtered list (different division), clear selection
          onChange(null);
        }
      } else if (globalChanged && value !== null) {
        // Global filter cleared, clear local filter too
        onChange(null);
      }
    }
  }, [
    syncWithGlobal,
    hasMultiBranchEnabled,
    branches.length,
    filteredBranches,
    globalFilter.branchId,
    value,
    onChange,
  ]);

  // Preselect user's working branch on mount
  const hasPreselectedRef = useRef(false);
  useEffect(() => {
    if (
      preselectUserBranch &&
      !hasPreselectedRef.current &&
      filteredBranches.length > 0 &&
      !value &&
      !(
        syncWithGlobal &&
        (globalFilter.businessVerticalId || globalFilter.divisionId || globalFilter.branchId)
      ) &&
      user?.workingBranchId
    ) {
      hasPreselectedRef.current = true;
      const userBranch = filteredBranches.find((b) => b.id === user.workingBranchId);
      if (userBranch) {
        onChange(userBranch);
      }
    }
  }, [
    preselectUserBranch,
    filteredBranches,
    value,
    syncWithGlobal,
    globalFilter.businessVerticalId,
    globalFilter.divisionId,
    globalFilter.branchId,
    user?.workingBranchId,
    onChange,
  ]);

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <AppSelect
      label={label}
      placeholder={placeholder}
      options={filteredBranches || []}
      value={value || null}
      getOptionLabel={(option: Branch) => {
        return option?.name || '';
      }}
      onChange={(newValue) => onChange(newValue as Branch | null)}
      isClearable
      isDisabled={disabled}
      formControlProps={{ sx: { minWidth: { xs: 180, sm: 220 } } }}
    />
  );
};

export default BranchFilter;
