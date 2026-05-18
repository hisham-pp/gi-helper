import { Props as ApexChartProps } from 'react-apexcharts';

export type ApexBaseChartProps = {
  width?: number;
  height?: number;
  colors?: string[];
  labels?: string[];
  options?: ApexChartProps['options'];
  type?: ApexChartProps['type'];
  series?: ApexChartProps['series'];
  size?: ApexChartProps['size'];
};

export type ApexRadialBarProps = ApexBaseChartProps & {
  subtitle?: string;
};
