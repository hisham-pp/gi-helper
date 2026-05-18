'use client';

import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { createUserProfile } from '@/redux/employee/employee.slice';
import ConfirmationModal from './confirmation-modal';

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onApply?: (value: string) => void;
  selectedEmployee: number[] | undefined;
};

const CreateUserModal: React.FC<CreateUserModalProps> = React.memo(
  ({ open, onClose, selectedEmployee }) => {
    const dispatch = useAppDispatch();

    const { isUserCreated } = useAppSelector((state) => state.employee);

    const handleSave = () => {
      dispatch(createUserProfile({ employeeIds: selectedEmployee }));
    };

    useEffect(() => {
      if (isUserCreated) {
        onClose();
      }
    }, [onClose, isUserCreated]);

    return (
      <ConfirmationModal
        open={open}
        onClose={onClose}
        onSave={() => handleSave()}
        title='Create User'
      >
        <Container sx={{ textAlign: 'center', padding: '10px', width: '330px' }}>
          <Typography>Create user profiles for all the selected employees</Typography>
        </Container>
      </ConfirmationModal>
    );
  },
);

CreateUserModal.displayName = 'Create User';
export default CreateUserModal;
