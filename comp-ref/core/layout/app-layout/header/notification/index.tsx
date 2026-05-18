import { useRouter } from 'next/navigation';
import { Fragment, memo, useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DrawerWithControls from '@/components/drawer-with-controls';
import { ROUTES } from '@/constant/routes';
import { userNotificationStatus } from '@/constant/user-notification';
import { AppSelect } from '@/core/components/app-select';
import { StatusEnumeration } from '@/enums/status';
import { NotificationRequestType, UserNotificationStatus } from '@/enums/userNotification';
import { usePermission } from '@/hooks/use-permission';
import useToast from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { resetOvertimeDetails } from '@/redux/attendance/overtime/overtime.slice';
import { cleanEntity as cleanRegularizationEntity } from '@/redux/attendance/regularization/regularization.slice';
import {
  fetchUserNotificationById,
  fetchUserNotifications,
  fetchUserNotificationUnreadCount,
  markAllAsRead,
  markNotificationAsRead,
} from '@/redux/user-notification/user-notification.slice';
import { OvertimeUpdateConfirmationModal } from '@/types/attendance/overtime';
import { ConfirmationModalType } from '@/types/attendance/regularization';
import UserNotificationType from '@/types/user-notification';
import OverTimeApprovalModal from '@/views/private/attendance/overtime-request/my-approvals/OvertimeApprovalModal';
import ViewOvertimeRequest from '@/views/private/attendance/overtime-request/my-approvals/ViewOvertimeRequest';
import RegularizationApprovalDrawer from '@/views/private/attendance/regularization/my-approvals/RegularizationApprovalDrawer';
import RegularizationApproveModal from '@/views/private/attendance/regularization/my-approvals/RegularizationApprovalModal';
import CircularView from '@/views/private/master/circular/CircularView';
import { NotificationHeaderContainer } from '../styled-components';
import NotificationDetail from './NotificationDetail';
import NotificationIcon from './NotificationIcon';
import NotificationTile from './NotificationTile';

const { leave, approvals, payroll, timeSheet, employee } = ROUTES;
const {
  ATTENDANCE_REGULARIZATION,
  CIRCULAR,
  DELEGATE,
  OVER_TIME,
  TIMESHEET,
  LEAVE,
  DELEGATE_REPLACEMENT,
  PAY_SLIP,
  PAYROLL_APPROVAL,
  PRIVILEGE,
  EMPLOYEE_EXIT,
  EMPLOYEE_TRANSFER,
} = NotificationRequestType;

const UserNotification = () => {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { showErrorToast } = useToast();
  const { havePermission } = usePermission();

  const { unreadNotificationCount, entities, entity, updateSuccess } = useAppSelector(
    (state) => state.userNotification,
  );

  const { updateSuccess: regularizationUpdateSuccess } = useAppSelector(
    (state) => state.attendanceRegularization,
  );

  const { updateSuccess: overtimeUpdateSuccess } = useAppSelector((state) => state.overtime);

  const [status, setStatus] = useState(userNotificationStatus[0]);
  const [isMainDrawerOpen, setMainDrawerOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewOverTimeDrawerOpen, setViewOverTimeDrawerOpen] = useState(false);
  const [itemToView, setItemToView] = useState<number | null>(null);
  const [selectedOvertimeId, setSelectedOvertimeId] = useState<number | null>(null);
  const [overTimeConfirmationModal, setOverTimeConfirmationModal] =
    useState<OvertimeUpdateConfirmationModal>({
      isOpen: false,
    });
  const [regularizationConfirmationModal, setRegularizationConfirmationModal] =
    useState<ConfirmationModalType>({
      isOpen: false,
    });
  const [regularizationDrawerOpen, setRegularizationDrawerOpen] = useState(false);
  const [selectedItemForRegularization, setSelectedItemForRegularization] = useState<number | null>(
    null,
  );

  const isUnread = useCallback((status: string) => status === UserNotificationStatus.UNREAD, []);
  const toggleDrawer = useCallback(
    (setDrawerState: React.Dispatch<React.SetStateAction<boolean>>) => () =>
      setDrawerState((prev: boolean) => !prev),
    [],
  );

  const toggleViewDrawerClose = useCallback(() => {
    setItemToView(null);
    setViewDrawerOpen(false);
  }, [setItemToView]);

  const toggleOverTimeViewDrawerClose = useCallback(() => {
    setSelectedOvertimeId(null);
    setViewOverTimeDrawerOpen(false);
  }, []);

  const toggleRegularizationDrawerClose = useCallback(() => {
    setRegularizationDrawerOpen(false);
    setSelectedItemForRegularization(null);
  }, [setSelectedItemForRegularization]);

  const handleClick = useCallback(
    (type: StatusEnumeration, otRequestApplicationId?: number | null) => () => {
      if (!otRequestApplicationId) return;

      setOverTimeConfirmationModal({
        isOpen: true,
        status: type,
        otRequestApplicationId: otRequestApplicationId ?? 0,
      });
    },
    [setOverTimeConfirmationModal],
  );

  const handleRegularizationClick = useCallback(
    (type: StatusEnumeration, referenceId?: number) => () => {
      setRegularizationConfirmationModal({
        isOpen: true,
        status: type,
        referenceId: referenceId ?? 0,
      });
    },
    [setRegularizationConfirmationModal],
  );

  const handleNotificationAction = useCallback(
    (notification: UserNotificationType) => {
      const { requestType, referenceId } = notification;

      switch (requestType) {
        case DELEGATE:
          setDetailDrawerOpen(true);
          break;
        case CIRCULAR:
          setViewDrawerOpen(true);
          break;
        case ATTENDANCE_REGULARIZATION:
          setSelectedItemForRegularization(referenceId ?? null);
          setRegularizationDrawerOpen(true);
          setMainDrawerOpen(false);
          break;
        case OVER_TIME:
          setSelectedOvertimeId(referenceId ?? null);
          setViewOverTimeDrawerOpen(true);
          break;
        case TIMESHEET:
          if (havePermission('timesheet.timesheet.approve')) {
            push(`${timeSheet.approvals.path}?referenceId=${referenceId}`);
          } else {
            push(`${timeSheet.root.path}?referenceId=${referenceId}`);
          }
          setMainDrawerOpen(false);
          break;
        case LEAVE:
          if (havePermission('leave.leave.approve')) {
            push(`${leave.approvals.path}?referenceId=${referenceId}`);
          } else {
            push(`${leave.root.path}?referenceId=${referenceId}`);
          }
          setMainDrawerOpen(false);
          break;
        case DELEGATE_REPLACEMENT:
          push(`${leave.root.path}/${referenceId}`);
          break;
        case PAYROLL_APPROVAL:
          push(`${payroll.payRun.root.path}/${referenceId}`);
          setMainDrawerOpen(false);
          break;
        case PRIVILEGE:
          push(`${approvals.root.path}/privilege/${referenceId}`);
          break;
        case EMPLOYEE_EXIT:
          push('/payroll/employee/exit-requests');
          setMainDrawerOpen(false);
          break;
        case EMPLOYEE_TRANSFER:
          if (havePermission('employees.employee-transfer.my-approvals')) {
            push(`${employee.transfer.myApprovals.path}?referenceId=${referenceId}`);
          } else {
            push(`${employee.transfer.root.path}?referenceId=${referenceId}`);
          }
          setMainDrawerOpen(false);
          break;
        case PAY_SLIP:
          null;
          break;
        default:
          break;
      }
    },
    [push, setDetailDrawerOpen, setViewDrawerOpen, setMainDrawerOpen, havePermission],
  );

  const handleTileClick = useCallback(
    (notification: UserNotificationType) => {
      if (notification?.requestType === CIRCULAR && notification?.referenceId) {
        setItemToView(notification.referenceId);
        setViewDrawerOpen(true);
      }

      if (notification?.requestType === OVER_TIME && notification?.referenceId) {
        setSelectedOvertimeId(notification.referenceId);
        setViewOverTimeDrawerOpen(true);
      }

      if (notification?.requestType === ATTENDANCE_REGULARIZATION && notification?.referenceId) {
        setSelectedItemForRegularization(notification.referenceId);
        setRegularizationDrawerOpen(true);
      }

      if (!notification?.id) {
        showErrorToast('Notification not found');
        return;
      }

      if (isUnread(notification.status)) {
        dispatch(markNotificationAsRead(notification.id));
      }

      dispatch(fetchUserNotificationById(notification.id));
      handleNotificationAction(notification);

      if (!notification?.actionNeeded) {
        setDetailDrawerOpen(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, isUnread, showErrorToast],
  );

  const markAllAsReadHandler = useCallback(() => dispatch(markAllAsRead()), [dispatch]);

  const fetchNotifications = useCallback(() => {
    dispatch(fetchUserNotificationUnreadCount());
    dispatch(fetchUserNotifications(status.id));
  }, [dispatch, status]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, updateSuccess, regularizationUpdateSuccess, overtimeUpdateSuccess]);

  useEffect(() => {
    if (overtimeUpdateSuccess) {
      dispatch(resetOvertimeDetails());
      toggleOverTimeViewDrawerClose();
    }
  }, [overtimeUpdateSuccess, dispatch, toggleOverTimeViewDrawerClose]);

  useEffect(() => {
    if (regularizationUpdateSuccess) {
      dispatch(cleanRegularizationEntity());
      toggleRegularizationDrawerClose();
    }
  }, [regularizationUpdateSuccess, dispatch, toggleRegularizationDrawerClose]);

  return (
    <>
      <NotificationIcon
        onClick={toggleDrawer(setMainDrawerOpen)}
        unreadNotificationCount={unreadNotificationCount}
      />
      <DrawerWithControls
        open={isMainDrawerOpen}
        title='Notifications'
        loading={false}
        showFooter={false}
        onClose={toggleDrawer(setMainDrawerOpen)}
        paperProps={{ sx: { width: '100%', maxWidth: 550 } }}
        contentProps={{ sx: { p: 0 } }}
      >
        <Stack gap={1}>
          <NotificationHeaderContainer container>
            <Grid size={5}>
              <AppSelect options={userNotificationStatus} value={status} onChange={setStatus} />
            </Grid>
            <Grid>
              {Boolean(unreadNotificationCount) && (
                <Link className='styled-link' onClick={markAllAsReadHandler}>
                  Mark all read
                </Link>
              )}
            </Grid>
          </NotificationHeaderContainer>
          <Box>
            {entities?.length ? (
              entities.map((notification, i) => (
                <Fragment key={`tile${i}`}>
                  <NotificationTile
                    notification={notification}
                    handleTileClick={handleTileClick}
                    isUnread={isUnread(notification.status)}
                  />
                </Fragment>
              ))
            ) : (
              <Box display='flex' justifyContent='center' alignItems='center'>
                <Typography variant='body2'>Notification not found</Typography>
              </Box>
            )}
          </Box>
          <DrawerWithControls
            open={isDetailDrawerOpen}
            title={entity.title}
            loading={false}
            onClose={toggleDrawer(setDetailDrawerOpen)}
            paperProps={{ sx: { width: '100%', maxWidth: 450, right: { xs: 0, md: '32%' } } }}
            filledButtonProps={{ label: 'Approve' }}
            outlineButtonProps={{ label: 'Reject' }}
          >
            <NotificationDetail notification={entity} />
          </DrawerWithControls>
        </Stack>
      </DrawerWithControls>
      <CircularView open={viewDrawerOpen} onClose={toggleViewDrawerClose} id={itemToView} />
      <ViewOvertimeRequest
        open={viewOverTimeDrawerOpen}
        onClose={toggleOverTimeViewDrawerClose}
        selectedItem={selectedOvertimeId}
        onApprove={handleClick(StatusEnumeration.APPROVED, selectedOvertimeId)}
        onReject={handleClick(StatusEnumeration.REJECTED, selectedOvertimeId)}
      />
      <RegularizationApprovalDrawer
        open={regularizationDrawerOpen}
        onClose={toggleRegularizationDrawerClose}
        id={selectedItemForRegularization}
        onApprove={
          selectedItemForRegularization
            ? handleRegularizationClick(StatusEnumeration.APPROVED, selectedItemForRegularization)
            : undefined
        }
        onReject={
          selectedItemForRegularization
            ? handleRegularizationClick(StatusEnumeration.REJECTED, selectedItemForRegularization)
            : undefined
        }
      />
      <OverTimeApprovalModal
        confirmationModal={overTimeConfirmationModal}
        setConfirmationModal={setOverTimeConfirmationModal}
        setOtApprovalSelected={() => {}}
      />
      <RegularizationApproveModal
        confirmationModal={regularizationConfirmationModal}
        setConfirmationModal={setRegularizationConfirmationModal}
        setRegApprovalSelected={() => {}}
      />
    </>
  );
};

export default memo(UserNotification);
