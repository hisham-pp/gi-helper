import { PatternFormat } from 'react-number-format';
import { NumberFormatValues } from 'react-number-format/types/types';
import { Any } from '@/types';

export const NumberFormatCustom = (props: Any) => {
  const { onChange, value, ...other } = props;

  const convertMinutesToHHMM = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(3, '0')}h : ${String(minutes).padStart(2, '0')}m`;
  };

  const handleChange = (values: NumberFormatValues) => {
    const { formattedValue } = values;
    const [hoursString, minutesString] = formattedValue
      .split(':')
      .map((segment) => segment?.trim());

    const hours = parseInt(hoursString, 10) || 0;
    const minutes = parseInt(minutesString, 10) || 0;

    const totalMinutes = hours * 60 + minutes;

    onChange({
      target: {
        value: totalMinutes,
      },
    });
  };

  return (
    <PatternFormat
      {...other}
      value={convertMinutesToHHMM(value)}
      onValueChange={handleChange}
      format='###h : ##m'
      mask='_'
    />
  );
};
