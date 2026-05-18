import React, { forwardRef, memo } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import TextField, { TextFieldVariants } from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';
import colors from '@/utils/colors';
import Icon from '../icon';
import AppTextFieldProps from './type';

const AppTextField = forwardRef<HTMLDivElement, AppTextFieldProps<TextFieldVariants>>(
  function AppTextField(
    {
      size = 'small',
      placeholder = 'common.enter',
      sx = {},
      fullWidth = true,
      isRequired = false,
      isEmail = false,
      slotProps = {},
      readOnly = false,
      onChange,
      type,
      label,
      value,
      ...rest
    },
    ref,
  ) {
    const t = useTheme();
    const { t: translate } = useTranslation();

    const { input: slotInput, ...otherSlotProps } = slotProps;

    const getLabelStyles = () => ({
      ['& .MuiInputLabel-root']: {
        [':after']: isRequired ? { content: "'*'", color: t.palette.error.main } : {},
      },
    });

    const getEmailAdornment = () =>
      isEmail && (
        <InputAdornment
          position='start'
          sx={{ borderRight: `1px solid ${t?.palette.grey[300]}`, pr: 2 }}
        >
          <Icon icon='ic:outline-email' />
        </InputAdornment>
      );

    const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
      if (type === 'number') {
        const target = event.target as HTMLInputElement;
        target.blur();
      }
    };

    return (
      <TextField
        size={size}
        autoComplete='off'
        fullWidth={fullWidth}
        placeholder={translate(placeholder)}
        ref={ref}
        type={type}
        onChange={onChange}
        onWheel={handleWheel}
        sx={{ ...getLabelStyles(), ...sx }}
        label={translate(label as string)}
        inputProps={{
          sx: {
            color: colors.common.black,
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px white inset',
            },
            '&.Mui-disabled': {
              WebkitTextFillColor: colors.text.neutralGray,
              color: colors.text.neutralGray,
            },
          },
        }}
        slotProps={{
          input: {
            readOnly: readOnly,
            startAdornment: getEmailAdornment(),
            ...slotInput,
          },
          ...otherSlotProps,
        }}
        value={value ?? ''}
        {...rest}
      />
    );
  },
);

export default memo(AppTextField);
