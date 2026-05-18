import React, { memo } from 'react';
import { Box, FormHelperText, FormLabel, Slider } from '@mui/material';
import EditableValue from './EditableValue';
import { StyledFormControl } from './styled-components';
import AppSliderProps from './type';

const AppSlider: React.FC<AppSliderProps> = ({
  label,
  isRequired = false,
  helperText,
  error = false,
  showValue = true,
  editableValue = true,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  onValueChange,
  sx = {},
  ...rest
}) => {
  const handleValueChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    const numValue = Array.isArray(newValue) ? newValue[0] : newValue;

    if (onValueChange) {
      onValueChange(numValue);
    }
    if (onChange) {
      onChange(event, newValue, activeThumb);
    }
  };

  return (
    <StyledFormControl error={error} disabled={disabled}>
      {label && (
        <Box className='label-container'>
          <FormLabel className={isRequired ? 'label required' : 'label'}>{label}</FormLabel>
          {showValue && (
            <EditableValue
              value={value}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              editable={editableValue}
              onChange={handleValueChange}
              error={error}
            />
          )}
        </Box>
      )}
      <Box className='slider-container'>
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          valueLabelDisplay='auto'
          disabled={disabled}
          marks={[
            { value: min, label: min.toString() },
            { value: max, label: max.toString() },
          ]}
          sx={sx}
          {...rest}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} className='helper-text'>
          {helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default memo(AppSlider);
