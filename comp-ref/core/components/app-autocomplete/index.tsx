'use client';

import React from 'react';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Translations from '../translations';

export interface AppAutocompleteProps<T> extends Omit<
  AutocompleteProps<T, false, false, false>,
  'renderInput'
> {
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  isRequired?: boolean;
  loading?: boolean;
}

function AppAutocomplete<T>({
  label,
  placeholder,
  error,
  helperText,
  required,
  isRequired,
  loading,
  disabled,
  ...rest
}: AppAutocompleteProps<T>) {
  const theme = useTheme();

  const getLabelStyles = () => ({
    ['& .MuiInputLabel-root']: {
      [':after']: isRequired ? { content: "'*'", color: theme.palette.error.main } : {},
    },
  });

  return (
    <Autocomplete
      {...rest}
      disabled={disabled}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={<Translations text={label} />}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required={required}
          size='small'
          sx={getLabelStyles()}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default AppAutocomplete;
