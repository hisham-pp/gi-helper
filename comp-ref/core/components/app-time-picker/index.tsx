import { forwardRef } from 'react';
import React from 'react';
import { useTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Any } from '@/types';
import AppTextfield from '../app-textfield';
import { AppTimePickerProps } from './types';

const AppTimePicker = forwardRef<HTMLDivElement, AppTimePickerProps>(
  function AppTimePicker(props, ref) {
    const {
      label,
      ampm = false,
      slotProps = {},
      errorMessage,
      showIcon = false,
      isRequired,
      ...rest
    } = props || {};
    const { textField, ...otherSlotProps } = slotProps;
    const theme = useTheme();

    const PickersTextField = React.forwardRef(function PickersTextField(props: Any, ref: Any) {
      return <AppTextfield ref={ref} isRequired={isRequired} {...props} />;
    });

    const getLabelStyles = () => ({
      ['& .MuiInputLabel-root']: {
        [':after']: isRequired ? { content: "'*'", color: theme.palette.error.main } : {},
      },
    });

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          ref={ref}
          label={label}
          ampm={ampm}
          slots={!showIcon ? { textField: PickersTextField } : {}}
          sx={showIcon ? getLabelStyles() : {}}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: !!errorMessage,
              helperText: errorMessage,
              ...textField,
            },
            popper: {
              sx: {
                '& .MuiMultiSectionDigitalClockSection-root': {
                  maxHeight: 180,
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (t) => t.palette.grey[400],
                    borderRadius: '4px',
                  },
                },
                '& .MuiMultiSectionDigitalClockSection-item': {
                  minHeight: 28,
                  fontSize: '0.8125rem',
                  padding: '4px 8px',
                },
                '& .MuiDialogActions-root': {
                  padding: '4px 8px',
                },
              },
            },
            ...otherSlotProps,
          }}
          {...rest}
        />
      </LocalizationProvider>
    );
  },
);

export default AppTimePicker;
