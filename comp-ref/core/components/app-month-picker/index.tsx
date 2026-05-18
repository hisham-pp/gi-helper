import React from 'react';
import DatePicker from 'react-datepicker';
import PickerInput from '../app-date-picker/PickerInput';
import { AppDatePickerProps } from '../app-date-picker/types';
import Wrapper from '../app-date-picker/Wrapper';

const AppMonthPicker: React.FC<AppDatePickerProps> = ({
  inputProps,
  dateFormat = 'MM-yyyy',
  ...rest
}) => {
  return (
    <Wrapper>
      <DatePicker
        customInput={<PickerInput inputProps={inputProps} />}
        dateFormat={dateFormat}
        showMonthYearPicker
        {...rest}
      />
    </Wrapper>
  );
};

export default AppMonthPicker;
