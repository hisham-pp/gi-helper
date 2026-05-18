'use client';

import React, { useCallback, useEffect } from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { AppSelect } from '@/core/components/app-select';
import AppTextfield from '@/core/components/app-textfield';
import Icon from '@/core/components/icon';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import {
  cleanPreviewResult,
  fetchAllGratuityTypes,
  previewCalculation,
} from '@/redux/master/gratuity-type/gratuity-type.slice';
import { GratuityPreviewRequest } from '@/types/master/gratuity-type';

type Props = {
  employeeId?: number;
  employeeList?: { id: number; name: string }[];
};

const GratuityCalculator: React.FC<Props> = ({ employeeId: defaultEmployeeId, employeeList }) => {
  const dispatch = useAppDispatch();

  const {
    allEntities: gratuityTypeList,
    previewResult,
    previewLoading,
  } = useAppSelector((state) => state.gratuityType);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GratuityPreviewRequest>({
    defaultValues: {
      gratuityTypeId: null as any,
      employeeId: defaultEmployeeId || (null as any),
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    dispatch(fetchAllGratuityTypes());
    return () => {
      dispatch(cleanPreviewResult());
    };
  }, [dispatch]);

  const handleCalculate = useCallback(
    (values: GratuityPreviewRequest) => {
      dispatch(previewCalculation(values));
    },
    [dispatch],
  );

  const selectedEmployee = watch('employeeId');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h6' gutterBottom>
        <Icon icon='mdi:calculator' fontSize={24} /> Gratuity Calculator
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component='form' onSubmit={handleSubmit(handleCalculate)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Controller
            name='gratuityTypeId'
            control={control}
            rules={{ required: 'Gratuity type is required' }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <AppSelect
                label='Gratuity Type'
                placeholder='Select Gratuity Type'
                options={gratuityTypeList}
                value={gratuityTypeList.find((g) => g.id === value) || null}
                onChange={(option: any) => onChange(option?.id)}
                error={Boolean(error?.message)}
                helperText={error?.message}
                isRequired
              />
            )}
          />

          {employeeList && (
            <Controller
              name='employeeId'
              control={control}
              rules={{ required: 'Employee is required' }}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <AppSelect
                  label='Employee'
                  placeholder='Select Employee'
                  options={employeeList}
                  value={employeeList.find((e) => e.id === value) || null}
                  onChange={(option: any) => onChange(option?.id)}
                  error={Boolean(error?.message)}
                  helperText={error?.message}
                  isRequired
                />
              )}
            />
          )}

          <Controller
            name='endDate'
            control={control}
            rules={{ required: 'End date is required' }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <AppTextfield
                label='End Date'
                type='date'
                value={value}
                onChange={onChange}
                error={Boolean(error?.message)}
                helperText={error?.message || 'Gratuity calculation end date'}
                isRequired
              />
            )}
          />
        </Box>

        <Button
          type='submit'
          variant='contained'
          fullWidth
          size='large'
          disabled={previewLoading}
          startIcon={
            previewLoading ? (
              <Icon icon='mdi:loading' className='animate-spin' />
            ) : (
              <Icon icon='mdi:calculator' />
            )
          }
        >
          {previewLoading ? 'Calculating...' : 'Calculate Gratuity'}
        </Button>
      </Box>

      {previewResult && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ bgcolor: 'primary.lighter', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant='h4' color='primary.main' textAlign='center'>
              {previewResult.amount.toLocaleString()}
              <Typography variant='caption' component='span' sx={{ ml: 1 }}>
                (Final Gratuity)
              </Typography>
            </Typography>
          </Box>

          <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
            Calculation Breakdown:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Service Period:
              </Typography>
              <Typography variant='body2' fontWeight='medium'>
                {previewResult.breakdown.yearsWorked}y {previewResult.breakdown.monthsWorked % 12}m
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Base Salary:
              </Typography>
              <Typography variant='body2' fontWeight='medium'>
                {previewResult.breakdown.baseSalary.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary'>
                Calculated Amount:
              </Typography>
              <Typography variant='body2' fontWeight='medium'>
                {previewResult.breakdown.calculatedAmount.toLocaleString()}
              </Typography>
            </Box>

            {previewResult.breakdown.capApplied && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='warning.main'>
                    After Cap:
                  </Typography>
                  <Typography variant='body2' fontWeight='medium' color='warning.main'>
                    {previewResult.breakdown.cappedAmount?.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'warning.lighter', p: 1, borderRadius: 1, mt: 1 }}>
                  <Typography variant='caption' color='warning.dark'>
                    ⚠️ Cap has been applied
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Formula Applied:
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  mt: 0.5,
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 0.5,
                }}
              >
                {previewResult.breakdown.formula}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default GratuityCalculator;
