import { ForwardedRef, forwardRef } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { useTranslation } from 'react-i18next';
import AppTextField from '../app-textfield';
import IconifyIcon from '../icon';
import { PickerProps } from './types';

const PickerInput = forwardRef(
  (
    { inputProps = {}, readOnly: _readOnly, ...props }: PickerProps & { readOnly?: boolean },
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const {
      label,
      placeholder,
      error,
      errorMessage,
      isRequired,
      showIcon = true,
      style,
      sx,
    } = inputProps;

    const { t } = useTranslation();

    return (
      <AppTextField
        inputRef={ref}
        label={t(label as string)}
        placeholder={placeholder}
        isRequired={isRequired}
        error={error}
        helperText={errorMessage}
        sx={sx}
        slotProps={{
          input: {
            style,
            endAdornment: (
              <>
                {showIcon && (
                  <InputAdornment position='end'>
                    <IconifyIcon icon='uil:calender' />
                  </InputAdornment>
                )}
              </>
            ),
          },
        }}
        {...props}
      />
    );
  },
);

PickerInput.displayName = 'PickerInput';

export default PickerInput;
