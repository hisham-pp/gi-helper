import { TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import { Dayjs } from 'dayjs';

export type AppTimePickerProps = {
  errorMessage?: string;
  isRequired?: boolean;
  showIcon?: boolean;
} & TimePickerProps<Dayjs>;
