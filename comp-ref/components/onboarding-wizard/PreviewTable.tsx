'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Icon from '@/core/components/icon';
import { ValidationError, ValidationWarning } from '@/types/master/company-onboarding';
import { animationMixins, getStaggerDelay, transitionMixins } from '@/utils/onboarding-animations';

export interface PreviewTableColumn {
  key: string;
  label: string;
  width?: string;
  formatter?: (value: unknown) => string;
  align?: 'left' | 'center' | 'right';
}

export interface PreviewTableProps {
  data: Record<string, unknown>[];
  columns: PreviewTableColumn[];
  validationErrors?: Record<number, ValidationError[]>;
  validationWarnings?: Record<number, ValidationWarning[]>;
  onSearch?: (value: string) => void;
  isLoading?: boolean;
  totalRows?: number;
  errorCount?: number;
  warningCount?: number;
  successCount?: number;
  // New props for editing and deletion
  editable?: boolean;
  onEditCell?: (rowIndex: number, columnKey: string, newValue: unknown) => void;
  onDeleteRow?: (rowIndex: number) => void;
  onConfirmUpload?: (data: Record<string, unknown>[]) => void;
  deletedRows?: Set<number>;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  data,
  columns,
  validationErrors = {},
  validationWarnings = {},
  onSearch,
  isLoading = false,
  totalRows = 0,
  errorCount = 0,
  warningCount = 0,
  successCount = 0,
  editable = false,
  onEditCell,
  onDeleteRow,
  onConfirmUpload,
  deletedRows = new Set(),
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue) return data;
    return data.filter((row) =>
      columns.some((col) => String(row[col.key]).toLowerCase().includes(searchValue.toLowerCase())),
    );
  }, [data, searchValue, columns]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const toggleRowExpand = (rowIndex: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(rowIndex)) {
      newSet.delete(rowIndex);
    } else {
      newSet.add(rowIndex);
    }
    setExpandedRows(newSet);
  };

  const handleEditCell = (rowIndex: number, columnKey: string) => {
    if (!editable) return;
    setEditingCell({ row: rowIndex, col: columnKey });
    setEditValue(String(data[rowIndex]?.[columnKey] || ''));
  };

  const handleSaveEdit = (rowIndex: number, columnKey: string) => {
    if (onEditCell) {
      onEditCell(rowIndex, columnKey, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (onDeleteRow) {
      onDeleteRow(rowIndex);
    }
  };

  const getRowStatus = (rowIndex: number) => {
    const errors = validationErrors[rowIndex];
    const warnings = validationWarnings[rowIndex];

    if (errors && errors.length > 0) {
      return { status: 'error', icon: 'mdi:alert-circle', count: errors.length };
    }
    if (warnings && warnings.length > 0) {
      return { status: 'warning', icon: 'mdi:alert', count: warnings.length };
    }
    return { status: 'success', icon: 'mdi:check-circle', count: 0 };
  };

  const getRowBackgroundColor = (rowIndex: number) => {
    const status = getRowStatus(rowIndex).status;
    if (status === 'error') return theme.palette.error.light || '#ffebee';
    if (status === 'warning') return theme.palette.warning.light || '#fff3e0';
    return theme.palette.success.light || '#e8f5e9';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Stats */}
      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          padding: '12px',
          backgroundColor: theme.palette.grey[50],
          borderRadius: '8px',
        }}
      >
        <Chip
          icon={<Icon icon='mdi:file-check' />}
          label={`Total Rows: ${totalRows}`}
          color='default'
          variant='outlined'
          size='small'
        />
        <Chip
          icon={<Icon icon='mdi:check-circle' />}
          label={`Valid: ${successCount}`}
          color='success'
          variant='filled'
          size='small'
        />
        <Chip
          icon={<Icon icon='mdi:alert' />}
          label={`Warnings: ${warningCount}`}
          color='warning'
          variant='filled'
          size='small'
        />
        <Chip
          icon={<Icon icon='mdi:alert-circle' />}
          label={`Errors: ${errorCount}`}
          color='error'
          variant='filled'
          size='small'
        />
      </Box>

      {/* Search */}
      {onSearch && (
        <Box sx={{ marginBottom: '16px' }}>
          <TextField
            size='small'
            placeholder='Search in preview...'
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Box sx={{ mr: 1 }}>
                    <Icon icon='mdi:magnify' />
                  </Box>
                </InputAdornment>
              ),
            }}
            variant='outlined'
            fullWidth
          />
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: isLoading ? '400px' : isMobile ? '400px' : '600px',
          overflow: 'auto',
          borderRadius: '8px',
          ...transitionMixins.smooth('all', '0.3s'),
        }}
      >
        <Table stickyHeader size={isMobile ? 'small' : 'small'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell
                align='center'
                sx={{
                  width: '50px',
                  fontWeight: 600,
                  backgroundColor: theme.palette.grey[200],
                }}
              >
                Status
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  width: '60px',
                  fontWeight: 600,
                  backgroundColor: theme.palette.grey[200],
                }}
              >
                Row #
              </TableCell>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.width || '150px',
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[200],
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {editable && (
                <TableCell
                  align='center'
                  sx={{
                    width: '100px',
                    fontWeight: 600,
                    backgroundColor: theme.palette.grey[200],
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align='center' sx={{ py: 4 }}>
                  <Typography variant='caption'>Loading preview...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align='center' sx={{ py: 4 }}>
                  <Typography variant='caption'>No data to display</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, rowIndex) => {
                const status = getRowStatus(rowIndex);
                const hasDetails = validationErrors[rowIndex] || validationWarnings[rowIndex];

                return (
                  <React.Fragment key={rowIndex}>
                    <TableRow
                      sx={{
                        backgroundColor: getRowBackgroundColor(rowIndex),
                        ...transitionMixins.smooth('all', '0.2s'),
                        ...animationMixins.fadeIn('0.3s', getStaggerDelay(rowIndex % 10, 0.02)),
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          transform: isMobile ? 'none' : 'scale(1.01)',
                        },
                      }}
                    >
                      {/* Status Icon */}
                      <TableCell align='center' sx={{ width: '50px' }}>
                        <Tooltip title={status.status}>
                          <Box
                            sx={{
                              color:
                                status.status === 'error'
                                  ? theme.palette.error.main
                                  : status.status === 'warning'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main,
                            }}
                          >
                            <Icon icon={status.icon} />
                          </Box>
                        </Tooltip>
                      </TableCell>

                      {/* Row Number */}
                      <TableCell align='center' sx={{ width: '60px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{rowIndex + 1}</span>
                          {hasDetails && (
                            <IconButton
                              size='small'
                              onClick={() => toggleRowExpand(rowIndex)}
                              sx={{ padding: '4px' }}
                            >
                              <Icon
                                icon={
                                  expandedRows.has(rowIndex) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                                }
                                fontSize='small'
                              />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>

                      {/* Data Cells */}
                      {columns.map((col) => {
                        const isEditing =
                          editable && editingCell?.row === rowIndex && editingCell?.col === col.key;

                        return (
                          <TableCell
                            key={`${rowIndex}-${col.key}`}
                            align={col.align || 'left'}
                            sx={{
                              minWidth: col.width || '150px',
                              maxWidth: col.width || '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              backgroundColor: isEditing
                                ? theme.palette.action.selected
                                : 'inherit',
                              cursor: editable ? 'pointer' : 'default',
                              padding: isEditing ? '4px' : '16px',
                            }}
                            onClick={() => editable && handleEditCell(rowIndex, col.key)}
                          >
                            {isEditing ? (
                              <TextField
                                size='small'
                                fullWidth
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleSaveEdit(rowIndex, col.key)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(rowIndex, col.key);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    height: '32px',
                                  },
                                }}
                              />
                            ) : (
                              <Tooltip
                                title={
                                  col.formatter ? col.formatter(row[col.key]) : String(row[col.key])
                                }
                              >
                                <span>
                                  {col.formatter
                                    ? col.formatter(row[col.key])
                                    : String(row[col.key] || '-')}
                                </span>
                              </Tooltip>
                            )}
                          </TableCell>
                        );
                      })}

                      {/* Actions Column */}
                      {editable && (
                        <TableCell align='center' sx={{ width: '100px' }}>
                          {!deletedRows.has(rowIndex) && (
                            <Tooltip title='Delete row'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => setDeleteConfirm(rowIndex)}
                              >
                                <Icon icon='mdi:delete' fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Expanded Details Row */}
                    {hasDetails && expandedRows.has(rowIndex) && (
                      <TableRow
                        sx={{
                          backgroundColor: theme.palette.grey[50],
                          ...animationMixins.slideInBottom('0.3s', '0s'),
                        }}
                      >
                        <TableCell
                          colSpan={columns.length + 2}
                          sx={{ padding: '16px', ...transitionMixins.smooth() }}
                        >
                          <Box>
                            {/* Errors */}
                            {validationErrors[rowIndex] &&
                              validationErrors[rowIndex].length > 0 && (
                                <Box sx={{ marginBottom: '12px' }}>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 600, color: 'error.main' }}
                                  >
                                    Errors ({validationErrors[rowIndex].length})
                                  </Typography>
                                  {validationErrors[rowIndex].map((error, idx) => (
                                    <Box
                                      key={idx}
                                      sx={{
                                        padding: '8px',
                                        marginTop: '4px',
                                        backgroundColor: theme.palette.error.light || '#ffcdd2',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                      }}
                                    >
                                      <strong>{error.field}:</strong> {error.message}
                                    </Box>
                                  ))}
                                </Box>
                              )}

                            {/* Warnings */}
                            {validationWarnings[rowIndex] &&
                              validationWarnings[rowIndex].length > 0 && (
                                <Box>
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ fontWeight: 600, color: 'warning.main' }}
                                  >
                                    Warnings ({validationWarnings[rowIndex].length})
                                  </Typography>
                                  {validationWarnings[rowIndex].map((warning, idx) => (
                                    <Box
                                      key={idx}
                                      sx={{
                                        padding: '8px',
                                        marginTop: '4px',
                                        backgroundColor: theme.palette.warning.light || '#ffe0b2',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                      }}
                                    >
                                      <strong>{warning.field}:</strong> {warning.message}
                                    </Box>
                                  ))}
                                </Box>
                              )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Upload Button */}
      {editable && onConfirmUpload && (
        <Box sx={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              const finalData = data.filter((_, idx) => !deletedRows.has(idx));
              onConfirmUpload(finalData);
            }}
            startIcon={<Icon icon='mdi:check' />}
          >
            Confirm & Upload
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Delete Row</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this row? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (deleteConfirm !== null) {
                handleDeleteRow(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PreviewTable;
