'use client';

import React, { useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { AppSelect } from '@/core/components/app-select';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllBusinessVerticals } from '@/redux/master/business-vertical/business-vertical.slice';
import { fetchAllClusters } from '@/redux/master/cluster/cluster.slice';
import { fetchAllDivisions } from '@/redux/master/division/division.slice';
import { fetchAllRegions } from '@/redux/master/region/region.slice';
import { BusinessVertical, Cluster, Division, Region } from '@/types/division-branch';

interface OrganizationalHierarchyFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  watch: UseFormWatch<T>;
  setValue?: UseFormSetValue<T>;
  businessVerticalName?: Path<T>;
  divisionName?: Path<T>;
  regionName?: Path<T>;
  clusterName?: Path<T>;
  isRequired?: boolean;
  divisionRequired?: boolean;
  disabled?: boolean;
  isEditMode?: boolean;
  // Current values for edit mode
  entityBusinessVertical?: BusinessVertical | null;
  entityDivision?: Division | null;
  entityRegion?: Region | null;
  entityCluster?: Cluster | null;
  // Callback when division changes (for parent forms to reset dependent fields)
  onDivisionChange?: (division: Division | null) => void;
  // Callback when any hierarchy field changes (for parent forms to reset dependent fields like branch)
  onHierarchyChange?: () => void;
  // When true, the Division field is not rendered (parent form renders it separately for layout purposes)
  hideDivision?: boolean;
}

/**
 * Reusable Organizational Hierarchy form field component.
 * Renders cascading dropdowns for: BV → Division → Subdivision → Region → Cluster
 * Only renders when hasMultiBranchEnabled is true for the company.
 * Auto-filters options based on parent selections.
 */
const OrganizationalHierarchyFormField = <T extends FieldValues>({
  control,
  watch,
  setValue,
  businessVerticalName = 'businessVertical' as Path<T>,
  divisionName = 'division' as Path<T>,
  regionName = 'region' as Path<T>,
  clusterName = 'cluster' as Path<T>,
  isRequired = false,
  divisionRequired,
  disabled = false,
  isEditMode = false,
  entityBusinessVertical,
  entityDivision,
  entityRegion,
  entityCluster,
  onDivisionChange,
  onHierarchyChange,
  hideDivision = false,
}: OrganizationalHierarchyFormFieldProps<T>): React.ReactElement | null => {
  const dispatch = useAppDispatch();

  // Redux state
  const { allEntities: businessVerticals = [] } = useAppSelector((state) => state.businessVertical);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { allEntities: regions = [] } = useAppSelector((state) => state.region);
  const { allEntities: clusters = [] } = useAppSelector((state) => state.cluster);
  const { entity: companyInfo } = useAppSelector((state) => state.company);
  const { currentContext } = useAppSelector((state) => state.divisionBranchContext);

  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Watch current selections for cascading
  const selectedBusinessVertical = watch(businessVerticalName);
  const selectedDivision = watch(divisionName);
  const selectedRegion = watch(regionName);

  // Fetch all hierarchy data on mount
  useEffect(() => {
    if (hasMultiBranchEnabled) {
      if ((businessVerticals?.length || 0) === 0) {
        dispatch(fetchAllBusinessVerticals());
      }
      if ((divisions?.length || 0) === 0) {
        dispatch(fetchAllDivisions());
      }
      if ((regions?.length || 0) === 0) {
        dispatch(fetchAllRegions({}));
      }
      if ((clusters?.length || 0) === 0) {
        dispatch(fetchAllClusters({}));
      }
    }
  }, [
    businessVerticals?.length,
    clusters?.length,
    dispatch,
    divisions?.length,
    hasMultiBranchEnabled,
    regions?.length,
  ]);

  // Filter divisions based on selected business vertical
  const filteredDivisions = useMemo(() => {
    if (!selectedBusinessVertical) return divisions;
    return divisions.filter((div) => div.businessVerticalId === selectedBusinessVertical.id);
  }, [divisions, selectedBusinessVertical]);

  // Filter clusters based on selected region
  const filteredClusters = useMemo(() => {
    if (!selectedRegion) return clusters;
    return clusters.filter((cluster) => cluster.regionId === selectedRegion.id);
  }, [clusters, selectedRegion]);

  // Set default values in edit mode
  useEffect(() => {
    if (isEditMode && setValue) {
      if (entityBusinessVertical) {
        setValue(businessVerticalName, entityBusinessVertical as PathValue<T, Path<T>>);
      }
      if (entityDivision) {
        setValue(divisionName, entityDivision as PathValue<T, Path<T>>);
      }
      if (entityRegion) {
        setValue(regionName, entityRegion as PathValue<T, Path<T>>);
      }
      if (entityCluster) {
        setValue(clusterName, entityCluster as PathValue<T, Path<T>>);
      }
    }
  }, [
    isEditMode,
    entityBusinessVertical,
    entityDivision,
    entityRegion,
    entityCluster,
    setValue,
    businessVerticalName,
    divisionName,
    regionName,
    clusterName,
  ]);

  // Auto-select user's current context division for new records (only once on mount)
  useEffect(() => {
    if (!isEditMode && setValue && currentContext?.divisionId && (divisions?.length || 0) > 0) {
      const contextDivision = divisions?.find((d) => d.id === currentContext.divisionId) || null;
      if (contextDivision) {
        setValue(divisionName, contextDivision as PathValue<T, Path<T>>);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisions?.length]);

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <Grid container spacing={5}>
      {/* Business Vertical */}
      <Controller
        name={businessVerticalName}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <AppSelect
            label='Business Vertical'
            placeholder='Select Business Vertical'
            options={businessVerticals}
            value={value}
            getOptionLabel={(option: BusinessVertical) => `${option.code} - ${option.name}`}
            onChange={(newValue: BusinessVertical | null) => {
              onChange(newValue ?? null);
              if (setValue) {
                setValue(divisionName, null as PathValue<T, Path<T>>);
                setValue(regionName, null as PathValue<T, Path<T>>);
                setValue(clusterName, null as PathValue<T, Path<T>>);
                onDivisionChange?.(null);
                onHierarchyChange?.();
              }
            }}
            isDisabled={disabled}
            error={Boolean(error?.message)}
            helperText={error?.message}
            isRequired={isRequired}
            isClearable
          />
        )}
      />
      {!hideDivision && (
        <Controller
          name={divisionName}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AppSelect
              label='Division'
              placeholder='Select Division'
              options={filteredDivisions}
              value={value}
              getOptionLabel={(option: Division) => {
                // return `${option.code} - ${option.name}`;
                return option?.name || '';
              }}
              onChange={(newValue: Division | null) => {
                onChange(newValue ?? null);
                if (setValue) {
                  setValue(regionName, null as PathValue<T, Path<T>>);
                  setValue(clusterName, null as PathValue<T, Path<T>>);
                  onDivisionChange?.(newValue);
                  onHierarchyChange?.();
                }
              }}
              isDisabled={disabled}
              error={Boolean(error?.message)}
              helperText={error?.message}
              isRequired={divisionRequired ?? isRequired}
              isClearable
            />
          )}
        />
      )}
      <Controller
        name={regionName}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <AppSelect
            label='Region'
            placeholder='Select Region'
            options={regions}
            value={value}
            getOptionLabel={(option: Region) => option.name}
            onChange={(newValue: Region | null) => {
              onChange(newValue ?? null);
              if (setValue) {
                setValue(clusterName, null as PathValue<T, Path<T>>);
                onHierarchyChange?.();
              }
            }}
            isDisabled={disabled}
            error={Boolean(error?.message)}
            helperText={error?.message}
            isRequired={isRequired}
            isClearable
          />
        )}
      />
      <Controller
        name={clusterName}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <AppSelect
            label='Cluster'
            placeholder='Select Cluster'
            options={filteredClusters}
            value={value}
            getOptionLabel={(option: Cluster) => option.name}
            onChange={(newValue: Cluster | null) => {
              onChange(newValue ?? null);
              onHierarchyChange?.();
            }}
            isDisabled={disabled}
            error={Boolean(error?.message)}
            helperText={error?.message}
            isRequired={isRequired}
            isClearable
          />
        )}
      />
    </Grid>
  );
};

export default OrganizationalHierarchyFormField;
