'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import { ImportJob } from '@/types/master/company-onboarding';

export interface JobProgressTrackerProps {
  job: ImportJob;
  onCancel?: () => void;
  onViewReport?: () => void;
}

export const JobProgressTracker: React.FC<JobProgressTrackerProps> = ({
  job,
  onCancel,
  onViewReport,
}) => {
  const theme = useTheme();
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  useEffect(() => {
    // Calculate estimated time remaining
    if (job.estimatedTimeRemaining) {
      const minutes = Math.ceil(job.estimatedTimeRemaining / 60);
      if (minutes > 0) {
        setEstimatedTime(minutes < 1 ? 'less than a minute' : `${minutes} minute(s)`);
      }
    }
  }, [job.estimatedTimeRemaining]);

  const isRunning = job.status === 'RUNNING' || job.status === 'PENDING';
  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'RUNNING':
      case 'PENDING':
        return 'info';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'mdi:check-circle';
      case 'RUNNING':
        return 'mdi:loading';
      case 'PENDING':
        return 'mdi:clock-outline';
      case 'FAILED':
        return 'mdi:alert-circle';
      case 'CANCELLED':
        return 'mdi:cancel';
      default:
        return 'mdi:help-circle';
    }
  };

  const successPercentage =
    job.totalRows > 0 ? Math.round((job.successCount / job.totalRows) * 100) : 0;

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
      }}
      elevation={2}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Import Progress
          </Typography>
          <Chip
            icon={<Icon icon={getStatusIcon(job.status)} />}
            label={job.status}
            color={getStatusColor(job.status)}
            size='small'
            sx={{
              fontWeight: 600,
              '& .MuiChip-icon': {
                animation: isRunning ? 'spin 2s linear infinite' : 'none',
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
          >
            <Typography variant='subtitle2'>Processing...</Typography>
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
              {job.processedRows} / {job.totalRows} rows
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={job.progress}
            sx={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: isCompleted
                  ? theme.palette.success.main
                  : isFailed
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='caption'>Progress: {job.progress}%</Typography>
            {estimatedTime && isRunning && (
              <Typography variant='caption'>ETA: {estimatedTime}</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6' sx={{ color: 'success.main', fontWeight: 600 }}>
              {job.successCount}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Success ({successPercentage}%)
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6' sx={{ color: 'error.main', fontWeight: 600 }}>
              {job.failureCount}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Failed
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6' sx={{ color: 'warning.main', fontWeight: 600 }}>
              {job.skippedCount}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Skipped
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {job.totalRows}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block' }}>
              Total
            </Typography>
          </Box>
        </Box>

        {/* Error Message */}
        {isFailed && job.errorMessage && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                padding: '12px',
                backgroundColor: theme.palette.error.light || '#ffebee',
                borderRadius: '4px',
              }}
            >
              <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600 }}>
                Error: {job.errorMessage}
              </Typography>
            </Box>
          </>
        )}

        {/* Timestamps */}
        {job.startedAt && (
          <Box sx={{ mt: 2 }}>
            <Typography variant='caption' display='block'>
              Started: {new Date(job.startedAt).toLocaleTimeString()}
            </Typography>
            {job.completedAt && (
              <Typography variant='caption' display='block'>
                Completed: {new Date(job.completedAt).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ gap: '8px', justifyContent: 'flex-end', padding: '12px 16px' }}>
        {isRunning && onCancel && (
          <Button
            onClick={onCancel}
            variant='outlined'
            color='error'
            size='small'
            startIcon={<Icon icon='mdi:close' />}
          >
            Cancel
          </Button>
        )}

        {isCompleted && onViewReport && (
          <Button
            onClick={onViewReport}
            variant='contained'
            color='success'
            size='small'
            startIcon={<Icon icon='mdi:file-document-outline' />}
          >
            View Report
          </Button>
        )}

        {isFailed && (
          <Button
            size='small'
            variant='contained'
            color='error'
            startIcon={<Icon icon='mdi:reload' />}
            disabled
          >
            Retry
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default JobProgressTracker;
