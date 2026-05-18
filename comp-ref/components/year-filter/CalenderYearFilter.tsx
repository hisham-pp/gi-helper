'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { DATE_FORMATS } from '@/constant/date-format';
import IconButton from '@/core/components/icon-button';
import { useAppDispatch, useAppSelector } from '@/libs/store/configure-store';
import { fetchCurrentAndPreviousCalendarYears } from '@/redux/master/configuration/calendar-settings/work-week/work-week.slice';
import { DateType } from '@/types';
import { CalendarYear } from '@/types/master/configuration/calendar-settings/calendar-year';
import { CalendarYearCard } from '@/views/private/leave/styled-components';

type Props = {
  onCalendarYearChange: (calendarYear: CalendarYear | null) => void;
};

const { DATE_MONTH_MMM } = DATE_FORMATS;

const formatCalendarYearLabel = (
  startDate: DateType | undefined,
  endDate: DateType | undefined,
): string => {
  const start = dayjs(startDate || new Date());
  const end = dayjs(endDate || new Date());

  return `${start.format(DATE_MONTH_MMM)} ${start.year()} - ${end.format(DATE_MONTH_MMM)} ${end.year()}`;
};

const CalendarYearFilter: React.FC<Props> = ({ onCalendarYearChange }) => {
  const dispatch = useAppDispatch();

  const calendarYearList = useAppSelector((state) => state?.workWeek?.calendarYearList ?? []);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [defaultDateRange, setDefaultDateRange] = useState<string>('');

  const handlePrevYear = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < calendarYearList.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [calendarYearList?.length]);

  const defaultYearIndex = useMemo(() => {
    if (!calendarYearList?.length) return -1;
    const currentYear = dayjs().year();
    const idx = calendarYearList.findIndex((year: CalendarYear) => {
      const startDateYear = year?.startDate ? dayjs(year.startDate).year() : null;
      return startDateYear === currentYear;
    });
    return idx !== -1 ? idx : 0;
  }, [calendarYearList]);

  const getCalendarYearLabel = (calendarYear: CalendarYear): string => {
    return formatCalendarYearLabel(calendarYear?.startDate, calendarYear?.endDate);
  };

  useEffect(() => {
    if (calendarYearList.length && currentIndex === -1) {
      setCurrentIndex(defaultYearIndex);
      const year = calendarYearList[defaultYearIndex];
      setDefaultDateRange(getCalendarYearLabel(year));
      onCalendarYearChange(year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarYearList, defaultYearIndex, currentIndex]);

  useEffect(() => {
    if (calendarYearList.length && currentIndex !== -1 && calendarYearList[currentIndex]) {
      const year = calendarYearList[currentIndex];
      setDefaultDateRange(getCalendarYearLabel(year));
      onCalendarYearChange(year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (!calendarYearList?.length) {
      dispatch(fetchCurrentAndPreviousCalendarYears());
    }
  }, [dispatch, calendarYearList?.length]);

  return (
    <CalendarYearCard>
      <IconButton onClick={handlePrevYear}>
        <Icon icon='material-symbols:keyboard-arrow-left' />
      </IconButton>
      <Typography>{defaultDateRange}</Typography>
      <IconButton onClick={handleNextYear}>
        <Icon icon='material-symbols:keyboard-arrow-right' />
      </IconButton>
    </CalendarYearCard>
  );
};

export default CalendarYearFilter;
