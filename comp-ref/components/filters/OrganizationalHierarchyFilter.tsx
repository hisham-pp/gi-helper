'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Grid } from '@mui/material';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllBusinessVerticals } from '@/redux/master/business-vertical/business-vertical.slice';
import { fetchAllClusters } from '@/redux/master/cluster/cluster.slice';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { fetchAllDivisions } from '@/redux/master/division/division.slice';
import { fetchAllRegions } from '@/redux/master/region/region.slice';
import { fetchAllSubDivisions } from '@/redux/master/sub-division/sub-division.slice';
import { BusinessVertical, Cluster, Division, Region, SubDivision } from '@/types/division-branch';

export interface OrganizationalHierarchyFilterState {
  businessVertical: BusinessVertical | null;
  division: Division | null;
  subDivision: SubDivision | null;
  region: Region | null;
  cluster: Cluster | null;
}

interface OrganizationalHierarchyFilterProps {
  value: OrganizationalHierarchyFilterState;
  onChange: (value: OrganizationalHierarchyFilterState) => void;
  disabled?: boolean;
  /** When true, syncs with global filter from header (default: true) */
  syncWithGlobal?: boolean;
  /** When true, only returns hierarchy data accessible to the current user based on access scope */
  scopeBased?: boolean;
}

/**
 * Reusable Organizational Hierarchy Filter component for list screens.
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Provides cascading dropdowns to filter by hierarchy levels.
 * When syncWithGlobal is true (default), auto-selects from global filter.
 */
const OrganizationalHierarchyFilter: React.FC<OrganizationalHierarchyFilterProps> = ({
  value,
  onChange,
  disabled = false,
  syncWithGlobal = true,
  scopeBased = false,
}) => {
  const dispatch = useAppDispatch();

  // Redux state
  const { allEntities: businessVerticals = [] } = useAppSelector((state) => state.businessVertical);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { allEntities: subDivisions = [] } = useAppSelector((state) => state.subDivision);
  const { allEntities: regions = [] } = useAppSelector((state) => state.region);
  const { allEntities: clusters = [] } = useAppSelector((state) => state.cluster);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { globalFilter } = useAppSelector((state) => state.divisionBranchContext);

  // Track if we've synced on mount to avoid infinite loops
  const hasSyncedRef = useRef(false);
  const prevGlobalDivisionIdRef = useRef<number | null>(null);
  // Track which company we've fetched data for
  const fetchedForCompanyRef = useRef<number | null>(null);

  // Only show if multi-branch is enabled
  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Fetch company info if not loaded (needed for hasMultiBranchEnabled check)
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch all hierarchy data when company changes or on initial load
  useEffect(() => {
    if (hasMultiBranchEnabled && companyInfo?.id) {
      // Only fetch if we haven't fetched for this company yet
      if (fetchedForCompanyRef.current !== companyInfo.id) {
        fetchedForCompanyRef.current = companyInfo.id;
        dispatch(fetchAllBusinessVerticals(scopeBased ? { scopeBased: true } : undefined));
        dispatch(fetchAllDivisions(scopeBased ? { scopeBased: true } : undefined));
        dispatch(fetchAllRegions({}));
        dispatch(fetchAllClusters({}));
      }
    }
  }, [dispatch, hasMultiBranchEnabled, companyInfo?.id, scopeBased]);

  // Filter divisions based on selected business vertical
  const filteredDivisions = useMemo(() => {
    if (!value.businessVertical) return divisions;
    return divisions.filter((div) => div.businessVerticalId === value.businessVertical!.id);
  }, [divisions, value.businessVertical]);

  // Filter subdivisions based on selected division
  const filteredSubDivisions = useMemo(() => {
    if (!value.division) return subDivisions;
    return subDivisions.filter((sub) => sub.divisionId === value.division!.id);
  }, [subDivisions, value.division]);

  // Filter clusters based on selected region
  const filteredClusters = useMemo(() => {
    if (!value.region) return clusters;
    return clusters.filter((cluster) => cluster.regionId === value.region!.id);
  }, [clusters, value.region]);

  // Sync with global filter when enabled
  useEffect(() => {
    if (
      !syncWithGlobal ||
      !hasMultiBranchEnabled ||
      divisions.length === 0 ||
      businessVerticals.length === 0
    ) {
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
        if (globalDivision && value.division?.id !== globalDivisionId) {
          // Also set the business vertical if available
          const businessVertical = globalDivision.businessVerticalId
            ? businessVerticals.find((bv) => bv.id === globalDivision.businessVerticalId)
            : null;

          onChange({
            ...value,
            businessVertical: businessVertical || null,
            division: globalDivision,
            // Clear dependent fields
            subDivision: null,
          });
        } else if (!globalDivision && value.division !== null) {
          // Global division not found, clear selection
          onChange({
            businessVertical: null,
            division: null,
            subDivision: null,
            region: null,
            cluster: null,
          });
        }
      } else if (globalChanged && value.division !== null) {
        // Global filter cleared, clear local filter too
        onChange({
          businessVertical: null,
          division: null,
          subDivision: null,
          region: null,
          cluster: null,
        });
      }
    }
  }, [
    syncWithGlobal,
    hasMultiBranchEnabled,
    divisions.length,
    businessVerticals.length,
    globalFilter.divisionId,
    value,
    onChange,
    divisions,
    businessVerticals,
  ]);

  // Handle field changes with cascading clear logic
  const handleBusinessVerticalChange = (newValue: BusinessVertical | null) => {
    onChange({
      businessVertical: newValue,
      division: null,
      subDivision: null,
      region: value.region, // Keep region independent
      cluster: value.cluster,
    });
  };

  const handleDivisionChange = (newValue: Division | null) => {
    onChange({
      ...value,
      division: newValue,
      subDivision: null,
    });
  };

  const handleSubDivisionChange = (newValue: SubDivision | null) => {
    onChange({
      ...value,
      subDivision: newValue,
    });
  };

  const handleRegionChange = (newValue: Region | null) => {
    onChange({
      ...value,
      region: newValue,
      cluster: null,
    });
  };

  const handleClusterChange = (newValue: Cluster | null) => {
    onChange({
      ...value,
      cluster: newValue,
    });
  };

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {/* Business Vertical */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <AppSelect
          label='Business Vertical'
          placeholder='All Business Verticals'
          options={businessVerticals}
          value={value.businessVertical ?? undefined}
          getOptionLabel={(option: BusinessVertical) => `${option.code} - ${option.name}`}
          onChange={(newValue) => handleBusinessVerticalChange(newValue as BusinessVertical | null)}
          isClearable
          isDisabled={disabled}
          formControlProps={{ sx: { minWidth: { xs: 180, sm: 200 } } }}
        />
      </Grid>

      {/* Division */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <AppSelect
          label='Division'
          placeholder='All Divisions'
          options={filteredDivisions}
          value={value.division ?? undefined}
          getOptionLabel={(option: Division) => `${option.code} - ${option.name}`}
          onChange={(newValue) => handleDivisionChange(newValue as Division | null)}
          isClearable
          isDisabled={disabled || !value.businessVertical}
          formControlProps={{ sx: { minWidth: { xs: 180, sm: 200 } } }}
        />
      </Grid>

      {/* Subdivision */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <AppSelect
          label='Subdivision'
          placeholder='All Subdivisions'
          options={filteredSubDivisions}
          value={value.subDivision ?? undefined}
          getOptionLabel={(option: SubDivision) => option.name}
          onChange={(newValue) => handleSubDivisionChange(newValue as SubDivision | null)}
          isClearable
          isDisabled={disabled || !value.division}
          formControlProps={{ sx: { minWidth: { xs: 180, sm: 200 } } }}
        />
      </Grid>

      {/* Region */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <AppSelect
          label='Region'
          placeholder='All Regions'
          options={regions}
          value={value.region ?? undefined}
          getOptionLabel={(option: Region) => option.name}
          onChange={(newValue) => handleRegionChange(newValue as Region | null)}
          isClearable
          isDisabled={disabled}
          formControlProps={{ sx: { minWidth: { xs: 180, sm: 200 } } }}
        />
      </Grid>

      {/* Cluster */}
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <AppSelect
          label='Cluster'
          placeholder='All Clusters'
          options={filteredClusters}
          value={value.cluster ?? undefined}
          getOptionLabel={(option: Cluster) => option.name}
          onChange={(newValue) => handleClusterChange(newValue as Cluster | null)}
          isClearable
          isDisabled={disabled || !value.region}
          formControlProps={{ sx: { minWidth: { xs: 180, sm: 200 } } }}
        />
      </Grid>
    </Grid>
  );
};

export default OrganizationalHierarchyFilter;
