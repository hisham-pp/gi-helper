'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { skeletonStyles } from '@/utils/onboarding-animations';

interface SkeletonLoaderProps {
  type: 'text' | 'card' | 'table' | 'form' | 'avatar' | 'button' | 'progress';
  count?: number;
  height?: number | string;
  width?: number | string;
  variant?: 'text' | 'rectangular' | 'circular';
}

/**
 * Skeleton Loader Component
 *
 * Displays loading placeholders with shimmer animation
 * Used during async operations (file uploads, API calls, etc.)
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  height = 'auto',
  width = '100%',
  variant = 'rectangular',
}) => {
  const theme = useTheme();
  const styles = skeletonStyles(theme);

  // Text skeleton
  if (type === 'text') {
    return (
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            width={width}
            height={height || '12px'}
            sx={{ mb: 1, ...styles.base }}
          />
        ))}
      </Box>
    );
  }

  // Avatar skeleton
  if (type === 'avatar') {
    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant='circular'
            width={height || 40}
            height={height || 40}
            sx={styles.base}
          />
        ))}
      </Box>
    );
  }

  // Button skeleton
  if (type === 'button') {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            width={width || 120}
            height={height || 40}
            sx={styles.base}
          />
        ))}
      </Box>
    );
  }

  // Card skeleton
  if (type === 'card') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant={variant} width='80%' height={24} sx={{ mb: 2, ...styles.base }} />
              <Skeleton variant={variant} width='100%' height={16} sx={{ mb: 1, ...styles.base }} />
              <Skeleton variant={variant} width='90%' height={16} sx={styles.base} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Form skeleton
  if (type === 'form') {
    return (
      <Box sx={{ p: 2 }}>
        {Array.from({ length: count || 5 }).map((_, i) => (
          <Box key={i} sx={{ mb: 3 }}>
            <Skeleton variant='text' width='30%' height={16} sx={{ mb: 1, ...styles.base }} />
            <Skeleton variant={variant} width='100%' height={40} sx={styles.base} />
          </Box>
        ))}
      </Box>
    );
  }

  // Progress/Table skeleton
  if (type === 'table') {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant='text' width='100%' height={16} sx={styles.base} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: count || 5 }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: 5 }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton variant='text' width='100%' height={16} sx={styles.base} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }

  // Progress skeleton
  if (type === 'progress') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: count || 3 }).map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant='text' width='40%' height={14} sx={{ mb: 1, ...styles.base }} />
            <Skeleton variant='rectangular' width='100%' height={8} sx={styles.base} />
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

export default SkeletonLoader;
