'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import { ExecutionReport } from '@/types/master/company-onboarding';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export interface ExecutionReportModalProps {
  open: boolean;
  report: ExecutionReport | null;
  onClose: () => void;
  onExport?: () => void;
}

export const ExecutionReportModal: React.FC<ExecutionReportModalProps> = ({
  open,
  report,
  onClose,
  onExport,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  if (!report) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const successPercentage = Math.round((report.successCount / report.totalRows) * 100);
  const failurePercentage = Math.round((report.failureCount / report.totalRows) * 100);
  const skippedPercentage = Math.round((report.skippedCount / report.totalRows) * 100);

  const processingSeconds = (report.processingTimeMs / 1000).toFixed(2);

  // Filter rows by status
  const successRows = report.rows.filter((r) => r.status === 'success');
  const failedRows = report.rows.filter((r) => r.status === 'failed');
  const skippedRows = report.rows.filter((r) => r.status === 'skipped');

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon icon='mdi:file-document-outline' />
            Execution Report
          </Box>
          <Chip label={report.section} size='small' color='primary' variant='outlined' />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary Card */}
        <Box
          sx={{
            padding: '16px',
            backgroundColor: theme.palette.grey[50],
            borderRadius: '8px',
            mb: 3,
          }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            Summary
          </Typography>

          {/* Progress Bars */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='caption'>Success</Typography>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {report.successCount} ({successPercentage}%)
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={successPercentage}
              sx={{
                height: '6px',
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.success.main,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='caption'>Failed</Typography>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {report.failureCount} ({failurePercentage}%)
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={failurePercentage}
              sx={{
                height: '6px',
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.error.main,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='caption'>Skipped</Typography>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {report.skippedCount} ({skippedPercentage}%)
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={skippedPercentage}
              sx={{
                height: '6px',
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette.warning.main,
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}
          >
            <Box>
              <Typography variant='caption' sx={{ display: 'block', fontWeight: 600 }}>
                Total Rows
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {report.totalRows}
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' sx={{ display: 'block', fontWeight: 600 }}>
                Processing Time
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {processingSeconds}s
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' sx={{ display: 'block', fontWeight: 600 }}>
                Rows/Second
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {(report.totalRows / parseFloat(processingSeconds)).toFixed(1)}
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' sx={{ display: 'block', fontWeight: 600 }}>
                Date
              </Typography>
              <Typography variant='body2'>
                {new Date(report.startedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Details Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`All (${report.rows.length})`} id='report-tab-0' />
            <Tab
              label={`Success (${report.successCount})`}
              id='report-tab-1'
              icon={
                <Box sx={{ mr: 1 }}>
                  <Icon icon='mdi:check-circle' />
                </Box>
              }
            />
            <Tab
              label={`Failed (${report.failureCount})`}
              id='report-tab-2'
              icon={
                <Box sx={{ mr: 1 }}>
                  <Icon icon='mdi:alert-circle' />
                </Box>
              }
            />
            <Tab
              label={`Skipped (${report.skippedCount})`}
              id='report-tab-3'
              icon={
                <Box sx={{ mr: 1 }}>
                  <Icon icon='mdi:skip-next' />
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* All Rows Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} sx={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size='small'
                        color={
                          row.status === 'success'
                            ? 'success'
                            : row.status === 'failed'
                              ? 'error'
                              : 'warning'
                        }
                        icon={
                          <Icon
                            icon={
                              row.status === 'success'
                                ? 'mdi:check-circle'
                                : row.status === 'failed'
                                  ? 'mdi:alert-circle'
                                  : 'mdi:skip-next'
                            }
                          />
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px' }}>
                      <code>{JSON.stringify(row.data).substring(0, 50)}...</code>
                    </TableCell>
                    <TableCell sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      {row.errorMessage || row.warnings?.join(', ') || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Success Rows Tab */}
        <TabPanel value={tabValue} index={1}>
          {successRows.length === 0 ? (
            <Alert severity='info'>No successful rows</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.success.light }}>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {successRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>
                        <code>{JSON.stringify(row.data).substring(0, 100)}...</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Failed Rows Tab */}
        <TabPanel value={tabValue} index={2}>
          {failedRows.length === 0 ? (
            <Alert severity='success'>No failed rows</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.error.light }}>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {failedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell sx={{ fontSize: '12px', color: 'error.main' }}>
                        {row.errorMessage}
                      </TableCell>
                      <TableCell sx={{ fontSize: '11px' }}>
                        <code>{row.errorDetails?.substring(0, 60)}...</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Skipped Rows Tab */}
        <TabPanel value={tabValue} index={3}>
          {skippedRows.length === 0 ? (
            <Alert severity='info'>No skipped rows</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.warning.light }}>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skippedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>
                        <code>{JSON.stringify(row.data).substring(0, 100)}...</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ gap: '8px', pt: 2 }}>
        {onExport && (
          <Button
            onClick={onExport}
            variant='outlined'
            startIcon={<Icon icon='mdi:file-export-outline' />}
          >
            Export
          </Button>
        )}
        <Button onClick={onClose} variant='contained' color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecutionReportModal;
