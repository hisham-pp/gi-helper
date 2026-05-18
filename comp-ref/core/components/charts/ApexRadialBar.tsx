'use client';

import React, { memo, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Any } from '@/types';
import { ApexRadialBarProps } from './types';
import { Chart } from '.';

const ApexRadialBar: React.FC<ApexRadialBarProps> = ({
  series = [],
  labels = [],
  colors = [],
  subtitle,
}) => {
  const { palette } = useTheme();

  const subtitleTruncated = useMemo(() => {
    if (!subtitle) return '';
    return subtitle.length > 25 ? subtitle.substring(0, 25) + '...' : subtitle;
  }, [subtitle]);

  const name = useMemo<Any>(
    () => ({
      show: true,
      offsetY: subtitle ? -78 : -72,
      fontWeight: 600,
      fontSize: '12px',
      color: palette.common.black,
      formatter: function (val: string) {
        const maxLength = 15;
        const words = val.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          if ((currentLine + word).length > maxLength && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        });

        if (currentLine.trim().length > 0) {
          lines.push(currentLine.trim());
        }

        if (subtitleTruncated) {
          lines.push(subtitleTruncated);
        }

        return lines;
      },
    }),
    [palette, subtitle, subtitleTruncated],
  );

  const chart = (
    <div className={subtitle ? 'has-subtitle' : undefined}>
      <Chart
        type='radialBar'
        series={series}
        width={350}
        options={{
          labels: labels,

          chart: {
            offsetY: 0,
            sparkline: {
              enabled: false,
            },
          },

          plotOptions: {
            radialBar: {
              startAngle: -67.7,
              endAngle: 67.7,
              hollow: {
                size: '75%',
              },
              track: {
                background: palette.action.hover,
                strokeWidth: '100%',
              },
              dataLabels: {
                name: name,
                value: {
                  show: false,
                },
              },
            },
          },

          fill: {
            type: 'gradient',
            colors: colors,
            gradient: {
              shade: 'light',
              shadeIntensity: 0.2,
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 25, 50, 75],
            },
          },
        }}
      />
    </div>
  );

  return chart;
};

export default memo(ApexRadialBar);
