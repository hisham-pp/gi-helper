import React, { FC, memo } from 'react';
import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PercentageIndicatorProps {
  used: number;
  total?: number;
  showLabel?: boolean;
  showTooltip?: boolean;
  height?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
}

const Container = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const ProgressWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const getColor = (
  percentage: number,
  warningThreshold: number,
  dangerThreshold: number,
): 'success' | 'warning' | 'error' => {
  if (percentage >= dangerThreshold) return 'error';
  if (percentage >= warningThreshold) return 'warning';
  return 'success';
};

const PercentageIndicator: FC<PercentageIndicatorProps> = ({
  used,
  total = 100,
  showLabel = true,
  showTooltip = true,
  height = 8,
  warningThreshold = 75,
  dangerThreshold = 100,
}) => {
  const usedRounded = Math.round(Number(used) || 0);
  const totalRounded = Math.round(Number(total) || 100);
  const percentage = Math.min((usedRounded / totalRounded) * 100, 100);
  const remaining = Math.max(totalRounded - usedRounded, 0);
  const color = getColor(percentage, warningThreshold, dangerThreshold);

  const label = `${usedRounded}% used${remaining > 0 ? ` (${remaining}% available)` : ''}`;
  const tooltipText = `${usedRounded}% of ${totalRounded}% allocated${
    percentage > 100 ? ' - OVER ALLOCATED!' : ''
  }`;

  const progressBar = (
    <ProgressWrapper>
      <LinearProgress
        variant='determinate'
        value={percentage}
        color={color}
        sx={{
          flex: 1,
          height: height,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 1,
          },
        }}
      />
      {showLabel && (
        <Typography
          variant='caption'
          color={color === 'error' ? 'error' : 'textSecondary'}
          fontWeight={color === 'error' ? 600 : 400}
          sx={{ minWidth: '60px', textAlign: 'right' }}
        >
          {Math.round(percentage)}%
        </Typography>
      )}
    </ProgressWrapper>
  );

  return (
    <Container>
      {showTooltip ? (
        <Tooltip title={tooltipText} arrow>
          {progressBar}
        </Tooltip>
      ) : (
        progressBar
      )}
      {showLabel && (
        <Typography variant='caption' color='textSecondary' sx={{ fontSize: '12px' }}>
          {label}
        </Typography>
      )}
    </Container>
  );
};

export default memo(PercentageIndicator);
