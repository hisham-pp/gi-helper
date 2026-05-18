'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import keys from '@/constant/keys';
import AppModal from '@/core/components/app-modal';
import { AppSelect } from '@/core/components/app-select';
import AppButton from '@/core/components/button';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import {
  setShowSelectionModal,
  switchContext,
} from '@/redux/context/division-branch-context.slice';
import { Branch, Division } from '@/types/division-branch';

type Props = {
  open: boolean;
  onClose?: () => void;
  allowClose?: boolean; // False after login, true for header switch
};

const ContextSelectionModal: React.FC<Props> = ({ open, onClose, allowClose = false }) => {
  const dispatch = useAppDispatch();
  const { userBranchAccess, contextSwitching, accessLoading } = useAppSelector(
    (state) => state.divisionBranchContext,
  );

  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Get unique divisions from user's access
  const divisions = useMemo(() => {
    const divisionMap = new Map<number, Division>();
    userBranchAccess.forEach((access) => {
      if (!divisionMap.has(access.division.id)) {
        divisionMap.set(access.division.id, access.division);
      }
    });
    return Array.from(divisionMap.values());
  }, [userBranchAccess]);

  // Get branches for selected division
  const branches = useMemo(() => {
    if (!selectedDivision) return [];
    return userBranchAccess
      .filter((access) => access.division.id === selectedDivision.id)
      .map((access) => access.branch);
  }, [userBranchAccess, selectedDivision]);

  // Try to restore last selection
  useEffect(() => {
    if (open && divisions.length > 0) {
      const lastContext = localStorage.getItem(keys.lastContextKey);
      if (lastContext) {
        try {
          const { divisionId } = JSON.parse(lastContext);
          const division = divisions.find((d) => d.id === divisionId);
          if (division) {
            setSelectedDivision(division);
          }
        } catch (e) {
          console.error('Error restoring last context:', e);
        }
      }
    }
  }, [open, divisions]);

  // Auto-select branch if only one, or restore from last selection
  useEffect(() => {
    if (branches.length === 1) {
      setSelectedBranch(branches[0]);
    } else if (branches.length > 0) {
      // Try to restore last branch
      const lastContext = localStorage.getItem(keys.lastContextKey);
      if (lastContext) {
        try {
          const { branchId } = JSON.parse(lastContext);
          const branch = branches.find((b) => b.id === branchId);
          if (branch) {
            setSelectedBranch(branch);
          }
        } catch (e) {
          console.error('Error restoring last branch:', e);
        }
      }
    }
  }, [branches]);

  const handleDivisionChange = useCallback((value: Division | null) => {
    setSelectedDivision(value);
    setSelectedBranch(null); // Reset branch when division changes
  }, []);

  const handleBranchChange = useCallback((value: Branch | null) => {
    setSelectedBranch(value);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedDivision || !selectedBranch) return;

    // Save preference
    localStorage.setItem(
      keys.lastContextKey,
      JSON.stringify({
        divisionId: selectedDivision.id,
        branchId: selectedBranch.id,
      }),
    );

    // Switch context (triggers token refresh)
    await dispatch(
      switchContext({
        divisionId: selectedDivision.id,
        branchId: selectedBranch.id,
      }),
    );
  }, [dispatch, selectedDivision, selectedBranch]);

  const handleClose = useCallback(() => {
    if (allowClose) {
      dispatch(setShowSelectionModal(false));
      onClose?.();
    }
  }, [allowClose, onClose, dispatch]);

  if (accessLoading) {
    return (
      <AppModal open={open} onClose={handleClose}>
        <Box sx={{ p: 4, minWidth: 400, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant='body2' mt={2}>
            Loading access permissions...
          </Typography>
        </Box>
      </AppModal>
    );
  }

  return (
    <AppModal open={open} onClose={handleClose}>
      <Box sx={{ p: 4, minWidth: 400 }}>
        <Typography variant='h6' mb={1}>
          Select Division & Branch
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={3}>
          Choose your working context to continue
        </Typography>

        <Stack gap={3}>
          <AppSelect
            label='Division'
            placeholder='Select a division'
            options={divisions}
            value={selectedDivision}
            onChange={handleDivisionChange}
            isRequired
            getOptionLabel={(opt) => (opt ? `${opt.code} - ${opt.name}` : '')}
            getOptionValue={(opt) => String(opt?.id)}
          />

          <AppSelect
            label='Branch'
            placeholder={selectedDivision ? 'Select a branch' : 'Select division first'}
            options={branches}
            value={selectedBranch}
            onChange={handleBranchChange}
            isRequired
            isDisabled={!selectedDivision}
            getOptionLabel={(opt) => (opt ? `${opt.code} - ${opt.name}` : '')}
            getOptionValue={(opt) => String(opt?.id)}
          />
        </Stack>

        <Box mt={4} display='flex' justifyContent='flex-end' gap={2}>
          {allowClose && (
            <AppButton variant='outlined' onClick={handleClose}>
              Cancel
            </AppButton>
          )}
          <AppButton
            onClick={handleConfirm}
            loading={contextSwitching}
            disabled={!selectedDivision || !selectedBranch}
          >
            Confirm
          </AppButton>
        </Box>
      </Box>
    </AppModal>
  );
};

export default ContextSelectionModal;
