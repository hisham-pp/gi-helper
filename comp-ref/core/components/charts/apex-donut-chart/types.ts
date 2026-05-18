export type ApexDonutChartProps = {
  primaryColor: string;
  secondaryColor: string;
  width: number;
  height: number;
  series: number[];
  type?: 'pie' | 'donut';
  ternaryColor?: string;
  extraColors?: string[];
  size?: string;
  stroke?: { show?: boolean; width?: number };
};
