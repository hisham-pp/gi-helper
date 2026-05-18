import dynamic from 'next/dynamic';
import React from 'react';
import { ApexBaseChartProps } from './types';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ApexBaseChart: React.FC<ApexBaseChartProps> = ({
  type = 'donut',
  series = [],
  options = {},
  height,
  ...rest
}) => {
  const { chart = {}, ...optionOthers } = options;
  const { ...chartOthers } = chart;

  return (
    <ApexChart
      type={type}
      series={series}
      options={{
        chart: {
          type: type,
          ...chartOthers,
        },
        ...optionOthers,
      }}
      height={height}
      {...rest}
    />
  );
};

export default ApexBaseChart;
