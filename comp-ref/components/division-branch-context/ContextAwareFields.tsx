'use client';

import React, { useEffect, useMemo } from 'react';
import { Stack } from '@mui/material';
import { Control, Controller, FieldValues, useWatch } from 'react-hook-form';
import AppAutocomplete from '@/core/components/app-autocomplete';
import { useDivisionBranchContext } from '@/hooks/use-division-branch-context';
import { Branch, Division } from '@/types/division-branch';

type Props = {
  control: Control<FieldValues>;
  setValue: (name: string, value: number | null) => void;
  divisionFieldName?: string;
  branchFieldName?: string;
  showDivision?: boolean;
  showBranch?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoPopulate?: boolean;
  direction?: 'row' | 'column';
};

/**
 * Context-aware Division and Branch form fields
 * Auto-populates from current context if autoPopulate is true
 * Provides cascading dropdown behavior (branch depends on division)
 */
const ContextAwareFields: React.FC<Props> = ({
  control,
  setValue,
  divisionFieldName = 'divisionId',
  branchFieldName = 'branchId',
  showDivision = true,
  showBranch = true,
  disabled = false,
  required = false,
  autoPopulate = true,
  direction = 'column',
}) => {
  const { currentContext, hasContext, accessibleDivisions, getBranchesForDivision } =
    useDivisionBranchContext();

  // Watch the division field to update branches
  const selectedDivisionId = useWatch({
    control,
    name: divisionFieldName,
  });

  // Get branches for selected division
  const branches = useMemo(() => {
    if (!selectedDivisionId) return [];
    return getBranchesForDivision(selectedDivisionId);
  }, [selectedDivisionId, getBranchesForDivision]);

  // Auto-populate from current context on mount
  useEffect(() => {
    if (autoPopulate && hasContext) {
      if (showDivision && currentContext.divisionId) {
        setValue(divisionFieldName, currentContext.divisionId);
      }
      if (showBranch && currentContext.branchId) {
        setValue(branchFieldName, currentContext.branchId);
      }
    }
  }, [
    autoPopulate,
    hasContext,
    currentContext,
    showDivision,
    showBranch,
    divisionFieldName,
    branchFieldName,
    setValue,
  ]);

  // Reset branch when division changes (if not from context)
  useEffect(() => {
    if (selectedDivisionId && !autoPopulate) {
      setValue(branchFieldName, null);
    }
  }, [selectedDivisionId, branchFieldName, setValue, autoPopulate]);

  return (
    <Stack gap={2} direction={direction}>
      {showDivision && (
        <Controller
          name={divisionFieldName}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AppAutocomplete
              label='Division'
              placeholder='Select division'
              options={accessibleDivisions}
              value={accessibleDivisions.find((d: Division) => d.id === value) || null}
              getOptionLabel={(option: Division) =>
                option?.name ? `${option.code} - ${option.name}` : ''
              }
              isOptionEqualToValue={(option: Division, val: Division) => option?.id === val?.id}
              onChange={(_, newValue: Division | null) => {
                onChange(newValue?.id || null);
                // Reset branch when division changes
                if (showBranch) {
                  setValue(branchFieldName, null);
                }
              }}
              error={Boolean(error?.message)}
              helperText={error?.message}
              disabled={disabled}
              required={required}
            />
          )}
        />
      )}

      {showBranch && (
        <Controller
          name={branchFieldName}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <AppAutocomplete
              label='Branch'
              placeholder={selectedDivisionId ? 'Select branch' : 'Select division first'}
              options={branches}
              value={branches.find((b: Branch) => b.id === value) || null}
              getOptionLabel={(option: Branch) =>
                option?.name ? `${option.code} - ${option.name}` : ''
              }
              isOptionEqualToValue={(option: Branch, val: Branch) => option?.id === val?.id}
              onChange={(_, newValue: Branch | null) => onChange(newValue?.id || null)}
              error={Boolean(error?.message)}
              helperText={error?.message}
              disabled={disabled || !selectedDivisionId}
              required={required}
            />
          )}
        />
      )}
    </Stack>
  );
};

export default ContextAwareFields;
