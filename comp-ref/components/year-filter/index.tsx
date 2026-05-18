'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import icons from '@/configs/icons';
import { DATE_FORMATS } from '@/constant/date-format';
import AppDatePicker from '@/core/components/app-date-picker';
import Icon from '@/core/components/icon';
import { DateISOType } from '@/types';
import { getYearRange } from '@/utils/day-utils';
import { CalendarYearCard } from '@/views/private/leave/styled-components';

icons.loadIcons(['material-symbols:keyboard-arrow-left', 'material-symbols:keyboard-arrow-right']);

export type RangeType = {
  fromDate: DateISOType;
  toDate: DateISOType;
};

type Props = {
  onYearChange: (range: RangeType, fullDate: Dayjs) => void;
  monthsShown?: number;
  inputWidth?: number;
  minDate?: Date;
  maxDate?: Date;
};

const StyledDatePicker = styled(AppDatePicker)<{ pickerwidth: number }>(({ pickerwidth }) => ({
  '& .MuiOutlinedInput-root fieldset': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    caretColor: 'transparent',
    fontSize: 14,
  },
  width: pickerwidth,
}));

const CurrentYearFilter: FC<Props> = ({
  onYearChange,
  monthsShown = 2,
  inputWidth = 210,
  minDate,
  maxDate,
}) => {
  const [selectedRange, setSelectedRange] = useState<RangeType>(() => {
    const currentYear = new Date().getFullYear();
    const initialRange = getYearRange(new Date(currentYear, 0, 1));
    return initialRange;
  });

  const updateYear = useCallback(
    (operation: 'add' | 'subtract') => {
      setSelectedRange((prev) => {
        const currentYear = dayjs(prev.fromDate).year();
        let newYear = operation === 'add' ? currentYear + 1 : currentYear - 1;
        const minYear = minDate ? dayjs(minDate).year() : undefined;
        const maxYear = maxDate ? dayjs(maxDate).year() : undefined;

        if (typeof minYear === 'number') {
          newYear = Math.max(newYear, minYear);
        }
        if (typeof maxYear === 'number') {
          newYear = Math.min(newYear, maxYear);
        }

        const newRange = getYearRange(new Date(newYear, 0, 1));
        return newRange;
      });
    },
    [minDate, maxDate],
  );

  const handlePrevYear = useCallback(() => updateYear('subtract'), [updateYear]);
  const handleNextYear = useCallback(() => updateYear('add'), [updateYear]);

  const onDateRangeChange = useCallback((fromDate: DateISOType, toDate: DateISOType) => {
    setSelectedRange({ fromDate, toDate });
  }, []);

  useEffect(() => {
    onYearChange(selectedRange, dayjs(selectedRange.fromDate));
  }, [selectedRange, onYearChange]);

  return (
    <CalendarYearCard>
      <IconButton onClick={handlePrevYear}>
        <Icon icon='material-symbols:keyboard-arrow-left' />
      </IconButton>
      <StyledDatePicker
        pickerwidth={inputWidth}
        dateFormat={DATE_FORMATS.DATE_DD_MMM_YYYY}
        selectsRange
        startDate={selectedRange.fromDate as Date}
        endDate={selectedRange.toDate as Date}
        key={`${selectedRange.fromDate?.getFullYear()}-${selectedRange.toDate?.getFullYear()}`}
        selected={null}
        monthsShown={monthsShown}
        minDate={minDate}
        maxDate={maxDate}
        onChange={([from, to]) => onDateRangeChange(from, to)}
        inputProps={{
          label: ' ',
          showIcon: false,
        }}
      />
      <IconButton onClick={handleNextYear}>
        <Icon icon='material-symbols:keyboard-arrow-right' />
      </IconButton>
    </CalendarYearCard>
  );
};

export default CurrentYearFilter;
