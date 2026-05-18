'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { HRMS_ENDPOINT } from '@/constant/api-endpoints';
import Icon from '@/core/components/icon';
import api from '@/libs/interceptors/api';

interface MasterDataItem {
  id: number;
  [key: string]: unknown;
}

interface GenericExcelMasterConfig {
  entityName: string; // e.g., "grades", "countries"
  displayName: string; // e.g., "Grades", "Countries"
  apiPath: string; // e.g., "/api/v1/masters/grades"
  icon?: string;
  columns: {
    key: string;
    label: string;
    render?: (value: unknown, row: MasterDataItem) => React.ReactNode;
  }[];
}

interface GenericExcelMasterImportStepProps {
  config: GenericExcelMasterConfig;
  onStepComplete?: () => void;
}

/**
 * Generic Excel-based Master Import/Export Component
 * Reusable for all masters with Excel import/export functionality
 */
const GenericExcelMasterImportStep: React.FC<GenericExcelMasterImportStepProps> = ({
  config,
  onStepComplete,
}) => {
  const [data, setData] = useState<MasterDataItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingSelected, setDownloadingSelected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success?: number;
    created?: number;
    updated?: number;
    failed: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  // Get base API path for import/export operations
  const getBaseApiPath = () => {
    // Extract base path from the apiPath config
    // Remove query params and trailing segments like '/list', '/list-complete', '/list-with-details', etc.
    const basePath = config.apiPath.replace(/\/(list.*|search.*)$/, '');
    return basePath;
  };

  // Fetch existing data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${HRMS_ENDPOINT}${config.apiPath}`);
      const items = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setData(items);
    } catch (err: unknown) {
      console.error(`Error fetching ${config.entityName}:`, err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || `Failed to fetch ${config.displayName.toLowerCase()}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiPath]);

  // Clear error and upload result when switching tabs (config changes)
  useEffect(() => {
    setError(null);
    setUploadResult(null);
    setSelectedIds([]);
  }, [config.entityName]);

  // Handle select all/none
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(data.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual selection
  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Download blank template
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError(null);
    try {
      const response = await api.get(
        `${HRMS_ENDPOINT}${getBaseApiPath()}/download-import-template`,
        { responseType: 'blob' },
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.entityName}_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error downloading template:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Download selected data
  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) {
      setError(`Please select at least one ${config.displayName.toLowerCase()} to export`);
      return;
    }

    setDownloadingSelected(true);
    setError(null);
    try {
      const idsParam = selectedIds.join(',');
      const response = await api.get(
        `${HRMS_ENDPOINT}${getBaseApiPath()}/download-selected?ids=${idsParam}`,
        { responseType: 'blob' },
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.entityName}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Error downloading selected:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to download selected data');
    } finally {
      setDownloadingSelected(false);
    }
  };

  // Upload and import
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `${HRMS_ENDPOINT}${getBaseApiPath()}/upload-template`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      setUploadResult(response.data.data);
      await fetchData(); // Refresh the list
    } catch (err: unknown) {
      console.error('Error uploading file:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Alert severity='info' icon={<Icon icon='mdi:information-variant' />} sx={{ mb: 3 }}>
        <strong>Bulk import/export {config.displayName.toLowerCase()}.</strong> Download the
        template, fill in data, and upload. You can also export existing records for editing.
      </Alert>

      {error && (
        <Alert severity='error' icon={<Icon icon='mdi:alert-circle' />} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Alert
          severity={uploadResult.failed > 0 ? 'warning' : 'success'}
          icon={<Icon icon={uploadResult.failed > 0 ? 'mdi:alert' : 'mdi:check-circle'} />}
          sx={{ mb: 3 }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            Import Results:
          </Typography>
          <Typography variant='body2'>
            {uploadResult.success !== undefined && `Success: ${uploadResult.success} | `}
            {uploadResult.created !== undefined && `Created: ${uploadResult.created} | `}
            {uploadResult.updated !== undefined && `Updated: ${uploadResult.updated} | `}
            Failed: {uploadResult.failed}
          </Typography>
          {uploadResult.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                Errors:
              </Typography>
              {uploadResult.errors.slice(0, 5).map((err, idx) => (
                <Typography key={idx} variant='caption' sx={{ display: 'block' }}>
                  Row {err.row}: {err.error}
                </Typography>
              ))}
              {uploadResult.errors.length > 5 && (
                <Typography variant='caption' sx={{ display: 'block', fontStyle: 'italic' }}>
                  ... and {uploadResult.errors.length - 5} more errors
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          startIcon={
            downloadingTemplate ? <CircularProgress size={20} /> : <Icon icon='mdi:download' />
          }
        >
          Download Blank Template
        </Button>

        <Button
          variant='outlined'
          color='secondary'
          onClick={handleDownloadSelected}
          disabled={downloadingSelected || selectedIds.length === 0}
          startIcon={
            downloadingSelected ? <CircularProgress size={20} /> : <Icon icon='mdi:file-export' />
          }
        >
          Export Selected ({selectedIds.length})
        </Button>

        <Button
          variant='contained'
          component='label'
          color='success'
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <Icon icon='mdi:upload' />}
        >
          Upload Excel
          <input type='file' hidden accept='.xlsx,.xls' onChange={handleUpload} />
        </Button>

        {onStepComplete && (
          <Button
            variant='contained'
            color='primary'
            onClick={onStepComplete}
            endIcon={<Icon icon='mdi:arrow-right' />}
            sx={{ ml: 'auto' }}
          >
            Continue
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Existing Data Table */}
      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
        Existing {config.displayName} ({data.length})
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 500, border: '1px solid #e0e0e0' }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell
                  padding='checkbox'
                  sx={{ position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#f5f5f5' }}
                >
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {config.columns.map((col, idx) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 600,
                      ...(idx === 0
                        ? {
                            position: 'sticky',
                            left: 42,
                            zIndex: 3,
                            backgroundColor: '#f5f5f5',
                            minWidth: 150,
                          }
                        : { minWidth: 100 }),
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={config.columns.length + 1}
                    align='center'
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No {config.displayName.toLowerCase()} found. Download the template and import to
                    get started.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell
                      padding='checkbox'
                      sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1 }}
                    >
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                      />
                    </TableCell>
                    {config.columns.map((col, idx) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          ...(idx === 0
                            ? {
                                fontWeight: 500,
                                position: 'sticky',
                                left: 42,
                                backgroundColor: 'white',
                                zIndex: 1,
                              }
                            : {}),
                        }}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] as React.ReactNode) || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GenericExcelMasterImportStep;
