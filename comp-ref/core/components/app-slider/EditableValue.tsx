import React, { ChangeEvent, KeyboardEvent, memo, useCallback, useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { Any } from '@/types';
import { EditableValueProps } from './type';

const EditableValue: React.FC<EditableValueProps> = ({
  value,
  disabled,
  editable,
  onChange,
  error = false,
  min,
  max,
  step,
}) => {
  const numericValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = numericValue ?? min ?? 0;
  const [inputValue, setInputValue] = useState<string>(String(normalizedValue));

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const validateAndUpdate = useCallback(
    (event?: React.SyntheticEvent<Any, Event>) => {
      let numValue = parseFloat(inputValue);
      const minValue = min ?? 0;
      const maxValue = max ?? 100;

      if (isNaN(numValue)) {
        numValue = minValue;
      } else if (numValue < minValue) {
        numValue = minValue;
      } else if (numValue > maxValue) {
        numValue = maxValue;
      }

      setInputValue(String(numValue));

      const syntheticEvent = event || new Event('change');
      onChange && onChange(syntheticEvent as Any, numValue, 0);
    },
    [inputValue, min, max, onChange],
  );

  const handleInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      validateAndUpdate(event);
    },
    [validateAndUpdate],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        validateAndUpdate(event);
        (event.target as HTMLInputElement).blur();
      }
    },
    [validateAndUpdate],
  );

  useEffect(() => {
    setInputValue(String(value ?? min ?? 0));
  }, [value, min]);

  if (!editable) {
    return (
      <Typography variant='body2' className='value-text'>
        {normalizedValue}
      </Typography>
    );
  }

  return (
    <TextField
      className='value-input'
      size='small'
      type='number'
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      error={error}
      variant='standard'
      slotProps={{
        htmlInput: {
          min,
          max,
          step,
        },
      }}
    />
  );
};

export default memo(EditableValue);
