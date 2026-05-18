import React, { useMemo } from 'react';
import DatePicker from 'react-datepicker';
import PickerInput from './PickerInput';
import { AppDatePickerProps } from './types';
import Wrapper from './Wrapper';

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  inputProps,
  dateFormat = 'dd-MM-yyyy',
  wrapperProps = {},
  ...rest
}) => {
  // Calculate minimum width for range pickers to prevent date truncation
  const isRangePicker = 'selectsRange' in rest && rest.selectsRange;
  const enhancedInputProps = useMemo(() => {
    if (isRangePicker) {
      return {
        ...inputProps,
        sx: {
          minWidth: 200,
          ...inputProps?.sx,
        },
      };
    }
    return inputProps;
  }, [inputProps, isRangePicker]);

  return (
    <Wrapper {...wrapperProps}>
      <DatePicker
        customInput={<PickerInput inputProps={enhancedInputProps} />}
        dateFormat={dateFormat}
        autoComplete='off'
        showMonthDropdown
        showYearDropdown
        popperProps={{ strategy: 'fixed' }}
        {...rest}
      />
    </Wrapper>
  );
};

export default AppDatePicker;
