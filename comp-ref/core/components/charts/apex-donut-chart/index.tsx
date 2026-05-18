import ApexBaseChart from '../ApexBaseChart';
import { ApexDonutChartProps } from './types';

const ApexDonutChart = ({
  primaryColor,
  secondaryColor,
  ternaryColor,
  extraColors = [],
  width,
  height,
  type = 'donut',
  series,
  size = '85',
  stroke = { show: false, width: 0 },
}: ApexDonutChartProps) => {
  const chartColors = [primaryColor, secondaryColor, ternaryColor, ...extraColors].filter(Boolean);

  return (
    <ApexBaseChart
      options={{
        legend: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        stroke: {
          show: stroke.show,
          width: stroke.width,
        },
        fill: {
          colors: chartColors,
        },
        plotOptions: {
          pie: {
            donut: {
              size: size,
              labels: {
                show: false,
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
      }}
      series={series}
      height={height}
      width={width}
      type={type}
    />
  );
};

export default ApexDonutChart;
