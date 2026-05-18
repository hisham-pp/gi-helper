'use client';

import React, { useCallback, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import DrawerWithControls from '@/components/drawer-with-controls';
import { AppSelect } from '@/core/components/app-select';
import AppSwitch from '@/core/components/app-switch';
import AppTextfield from '@/core/components/app-textfield';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchAllPrivileges } from '@/redux/master/privilege/privilege.slice';
import { defaultMasterEntity, MasterEntity } from '@/types/master';
import { MasterSimpleCrudProps } from './types';

const validationSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
});

const MasterSimpleCrud: React.FC<MasterSimpleCrudProps> = ({
  open,
  title,
  values,
  loading,
  updating,
  isShowPrivilege = false,
  onSubmit,
  onClose,
}) => {
  const { control, reset, handleSubmit } = useForm<MasterEntity>({
    defaultValues: defaultMasterEntity,
    resolver: yupResolver(validationSchema),
  });
  const dispatch = useAppDispatch();

  const handleOnSubmit = useCallback(
    (values: MasterEntity) => {
      if (isShowPrivilege) {
        const finalData: MasterEntity = {
          ...values,
          privilegeIds: values?.privileges?.map((id) => Number(id?.id)) ?? [],
        };
        onSubmit && onSubmit(finalData);
      } else {
        onSubmit && onSubmit(values);
      }
    },
    [isShowPrivilege, onSubmit],
  );

  const resetState = useCallback(() => reset(defaultMasterEntity), [reset]);
  const privilegeList = useAppSelector((state) => state.privilege.list);

  useEffect(() => {
    if (values?.id) {
      reset(values);
    } else {
      resetState();
    }

    return () => {
      resetState();
    };
  }, [values, open, reset, resetState]);

  useEffect(() => {
    isShowPrivilege && dispatch(fetchAllPrivileges());
  }, [dispatch, isShowPrivilege]);

  return (
    <DrawerWithControls
      component='form'
      open={open}
      title={title}
      loading={loading}
      filledButtonProps={{ loading: updating }}
      outlineButtonProps={{ disabled: updating }}
      onClose={onClose}
      onSave={handleSubmit(handleOnSubmit)}
    >
      <Stack mt={3} gap={4}>
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <AppTextfield
              label='Name'
              placeholder='Enter'
              error={Boolean(error?.message)}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        {isShowPrivilege && (
          <Controller
            name='privileges'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <AppSelect
                label='Privileges'
                placeholder='Select '
                error={Boolean(error?.message)}
                helperText={error?.message}
                isMulti
                options={privilegeList}
                {...field}
              />
            )}
          />
        )}
        <Controller
          name='isActive'
          control={control}
          render={({ field: { value, onChange } }) => (
            <AppSwitch label='Active' checked={value} onChange={onChange} />
          )}
        />
      </Stack>
    </DrawerWithControls>
  );
};

export default MasterSimpleCrud;
