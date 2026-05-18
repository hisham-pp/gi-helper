'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import { DeleteModal } from '@/components/custom-modals';
import AppTable from '@/core/components/app-table';
import { Header } from '@/core/components/app-table/types';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import useSalaryLabels from '@/hooks/use-salary-labels';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import {
  deleteRevision,
  fetchEmployeeSalary,
  fetchEmployeeSalaryRevisalHistory,
} from '@/redux/employee/salary/salary.slice';
import { SalaryPackageDetail } from '@/types/employee';
import colors from '@/utils/colors';
import { formatMonthYearFull } from '@/utils/day-utils';
import { getOrDefault } from '@/utils/string-utils';
import SalaryRevisionDetailDrawer from './SalaryRevisionDetailDrawer';

type Props = {
  isEpfEnabled?: boolean;
  isEsiEnabled?: boolean;
  salaryPackageRevisionHistory?: SalaryPackageDetail[];
  employeeId?: number;
};

function HistoryTable({
  salaryPackageRevisionHistory,
  isEpfEnabled,
  isEsiEnabled,
  employeeId,
}: Props) {
  const { formateCurrency } = useCurrencyFormatter();
  const { getSalaryLabel } = useSalaryLabels();
  const dispatch = useAppDispatch();
  const { updating, updateSuccess } = useAppSelector((state) => state.employeeSalary);

  const [selectedRevision, setSelectedRevision] = useState<SalaryPackageDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revisionToDelete, setRevisionToDelete] = useState<SalaryPackageDetail | null>(null);

  const handleViewDetails = useCallback((revision: SalaryPackageDetail) => {
    setSelectedRevision(revision);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRevision(null);
  }, []);

  const handleDeleteClick = useCallback((revision: SalaryPackageDetail) => {
    setRevisionToDelete(revision);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!revisionToDelete?.id) return;
    dispatch(deleteRevision(revisionToDelete.id));
  }, [dispatch, revisionToDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setRevisionToDelete(null);
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      if (employeeId) {
        dispatch(fetchEmployeeSalaryRevisalHistory(employeeId));
        dispatch(fetchEmployeeSalary(employeeId));
      }
      setDeleteDialogOpen(false);
      setRevisionToDelete(null);
    }
  }, [updateSuccess, employeeId, dispatch]);

  const headers: Header[] = [
    { columnKey: 'previousCTC', header: getSalaryLabel('previousCtc') },
    { columnKey: 'revisedCTC', header: getSalaryLabel('revisedCtc') },
    { columnKey: 'difference', header: 'Difference' },
    { columnKey: 'effective_from', header: 'Effective From' },
    { columnKey: 'designation', header: 'Revised Designation' },
    { columnKey: 'revisedBy', header: 'Revised By' },
    { columnKey: 'action', header: '' },
  ];

  const getDifference = useCallback(
    (item: SalaryPackageDetail) => {
      return formateCurrency(Number(item.totalPay) - Number(item.totalPayPrevious));
    },
    [formateCurrency],
  );

  const rows = useMemo(
    () =>
      salaryPackageRevisionHistory?.map((item) => ({
        previousCTC: { value: formateCurrency(item?.totalPayPrevious || 0) },
        revisedCTC: { value: formateCurrency(item?.totalPay || 0) },
        difference: { value: getDifference(item) },
        effective_from: {
          value: formatMonthYearFull(
            item?.effectiveFromMonth as number,
            item?.effectiveFromYear as number,
          ),
        },
        designation: { value: getOrDefault(item?.designation?.name, '-') },
        revisedBy: { value: getOrDefault(item?.revisedByName, '-') },
        action: {
          value: (
            <Stack direction='row' spacing={1} alignItems='center'>
              <Button
                variant='outlined'
                size='small'
                onClick={() =>
                  handleViewDetails({
                    ...item,
                    difference: getDifference(item),
                    id: item.id,
                  })
                }
              >
                View Details
              </Button>
              <Tooltip title='Delete Revision'>
                <IconButton size='small' color='error' onClick={() => handleDeleteClick(item)}>
                  <Icon icon='fluent:delete-12-filled' color={colors.dander.appleRed} />
                </IconButton>
              </Tooltip>
            </Stack>
          ),
        },
      })) || [],
    [
      salaryPackageRevisionHistory,
      formateCurrency,
      getDifference,
      handleViewDetails,
      handleDeleteClick,
    ],
  );

  return (
    <>
      <AppTable headers={headers} rows={rows} />
      <SalaryRevisionDetailDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        revision={selectedRevision}
        isEpfEnabled={isEpfEnabled}
        isEsiEnabled={isEsiEnabled}
      />
      <DeleteModal
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
        containedButtonProps={{ loading: updating }}
        confirmationText={`You want to delete this salary revision effective from ${
          revisionToDelete
            ? formatMonthYearFull(
                revisionToDelete.effectiveFromMonth as number,
                revisionToDelete.effectiveFromYear as number,
              )
            : ''
        }?`}
      />
    </>
  );
}

export default HistoryTable;
