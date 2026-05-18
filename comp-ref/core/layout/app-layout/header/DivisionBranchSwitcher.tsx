'use client';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DrawerWithControls from '@/components/drawer-with-controls';
import { AppSelect } from '@/core/components/app-select';
import Icon from '@/core/components/icon';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import {
  resetGlobalFilter,
  setGlobalBranchFilter,
  setGlobalBusinessVerticalFilter,
  setGlobalDivisionFilter,
} from '@/redux/context/division-branch-context.slice';
import { fetchAllBranches } from '@/redux/master/branch/branch.slice';
import { fetchAllBusinessVerticals } from '@/redux/master/business-vertical/business-vertical.slice';
import { fetchCompanyAccount } from '@/redux/master/company/company.slice';
import { fetchAllDivisions } from '@/redux/master/division/division.slice';
import { Branch, BusinessVertical, Division } from '@/types/division-branch';

const DivisionBranchSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { globalFilter } = useAppSelector((state) => state.divisionBranchContext);
  const { allEntities: businessVerticals = [] } = useAppSelector((state) => state.businessVertical);
  const { allEntities: divisions = [] } = useAppSelector((state) => state.division);
  const { allEntities: branches = [] } = useAppSelector((state) => state.branch);
  const { entity: companyInfo } = useAppSelector((state) => state.company);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Only show if multi-branch enabled
  const hasMultiBranchEnabled = companyInfo?.hasMultiBranchEnabled;

  // Ensure company info is loaded
  useEffect(() => {
    if (!companyInfo?.id) {
      dispatch(fetchCompanyAccount());
    }
  }, [dispatch, companyInfo?.id]);

  // Fetch scope-based hierarchy data on mount
  useEffect(() => {
    if (hasMultiBranchEnabled) {
      if (businessVerticals.length === 0) {
        dispatch(fetchAllBusinessVerticals({ scopeBased: true }));
      }
      if (divisions.length === 0) {
        dispatch(fetchAllDivisions({ scopeBased: true }));
      }
      if (branches.length === 0) {
        dispatch(fetchAllBranches({ scopeBased: true }));
      }
    }
  }, [
    dispatch,
    hasMultiBranchEnabled,
    businessVerticals.length,
    divisions.length,
    branches.length,
  ]);

  // Filter divisions by selected BV
  const filteredDivisions = useMemo(() => {
    if (!globalFilter.businessVerticalId) return divisions;
    return divisions.filter((d) => d.businessVerticalId === globalFilter.businessVerticalId);
  }, [divisions, globalFilter.businessVerticalId]);

  // Filter branches by selected division
  const filteredBranches = useMemo(() => {
    if (!globalFilter.divisionId) return branches;
    return branches.filter((b) => b.divisionId === globalFilter.divisionId);
  }, [branches, globalFilter.divisionId]);

  // Get selected objects
  const selectedBV = useMemo(
    () => businessVerticals.find((bv) => bv.id === globalFilter.businessVerticalId) || null,
    [businessVerticals, globalFilter.businessVerticalId],
  );

  const selectedDivision = useMemo(
    () => divisions.find((d) => d.id === globalFilter.divisionId) || null,
    [divisions, globalFilter.divisionId],
  );

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === globalFilter.branchId) || null,
    [branches, globalFilter.branchId],
  );

  // Display label for the button
  const displayLabel = useMemo(() => {
    const primary = globalFilter.businessVerticalName || 'All Verticals';
    if (globalFilter.divisionName && globalFilter.branchName) {
      return { primary, secondary: `${globalFilter.divisionName} / ${globalFilter.branchName}` };
    }
    if (globalFilter.divisionName) {
      return { primary, secondary: globalFilter.divisionName };
    }
    return { primary, secondary: 'All Divisions' };
  }, [globalFilter]);

  const handleOpenDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleClearFilter = useCallback(() => {
    dispatch(resetGlobalFilter());
    setDrawerOpen(false);
  }, [dispatch]);

  const handleBVChange = useCallback(
    (bv: BusinessVertical | null) => {
      dispatch(
        setGlobalBusinessVerticalFilter({
          businessVerticalId: bv?.id || null,
          businessVerticalName: bv?.name || null,
        }),
      );
    },
    [dispatch],
  );

  const handleDivisionChange = useCallback(
    (division: Division | null) => {
      dispatch(
        setGlobalDivisionFilter({
          divisionId: division?.id || null,
          divisionName: division?.name || null,
        }),
      );
    },
    [dispatch],
  );

  const handleBranchChange = useCallback(
    (branch: Branch | null) => {
      dispatch(
        setGlobalBranchFilter({
          branchId: branch?.id || null,
          branchName: branch?.name || null,
        }),
      );
    },
    [dispatch],
  );

  // Don't render if multi-branch is not enabled
  if (!hasMultiBranchEnabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpenDrawer}
        variant='text'
        startIcon={<Icon icon='mdi:office-building' fontSize={16} />}
        endIcon={<Icon icon='mdi:chevron-down' fontSize={16} />}
        sx={{
          textTransform: 'none',
          color: 'text.primary',
          minWidth: 140,
          maxWidth: 180,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Box sx={{ textAlign: 'left', overflow: 'hidden', flex: 1 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            lineHeight={1.2}
            fontSize='0.7rem'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayLabel.primary}
          </Typography>
          <Typography
            variant='caption'
            fontWeight={500}
            lineHeight={1.2}
            fontSize='0.75rem'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {displayLabel.secondary}
          </Typography>
        </Box>
      </Button>

      <DrawerWithControls
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          <Box>
            <Typography variant='h6' fontWeight={600}>
              Global Filter
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Filter data across all pages
            </Typography>
          </Box>
        }
        paperProps={{
          sx: { width: 400 },
        }}
        filledButtonProps={{
          label: 'Apply',
          onClick: handleCloseDrawer,
          size: 'medium',
        }}
        outlineButtonProps={{
          label: 'Clear',
          onClick: handleClearFilter,
          size: 'medium',
        }}
        contentProps={{
          sx: { p: 3, display: 'flex', flexDirection: 'column', gap: 3 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AppSelect
            label='Business Vertical'
            placeholder='All Verticals'
            options={businessVerticals}
            value={selectedBV ?? undefined}
            onChange={(value) => handleBVChange(value as BusinessVertical | null)}
            getOptionLabel={(opt: BusinessVertical) => opt.name}
            isClearable
            formControlProps={{ sx: { width: '100%' } }}
          />
          <AppSelect
            label='Division'
            placeholder='All Divisions'
            options={filteredDivisions}
            value={selectedDivision ?? undefined}
            onChange={(value) => handleDivisionChange(value as Division | null)}
            getOptionLabel={(opt: Division) => `${opt.code} - ${opt.name}`}
            isClearable
            formControlProps={{ sx: { width: '100%' } }}
          />
          <AppSelect
            label='Branch'
            placeholder='All Branches'
            options={filteredBranches}
            value={selectedBranch ?? undefined}
            onChange={(value) => handleBranchChange(value as Branch | null)}
            getOptionLabel={(opt: Branch) => `${opt.code} - ${opt.name}`}
            isClearable
            formControlProps={{ sx: { width: '100%' } }}
          />
        </Box>
      </DrawerWithControls>
    </>
  );
};

export default memo(DivisionBranchSwitcher);
