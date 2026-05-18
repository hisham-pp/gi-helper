'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Box, Chip, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { StatusChip } from '@/components/status-chips';
import { DocumentFieldConfig } from '@/types/master/employee-document-type';
import { formatDate as formatDayjs, isDateExpired } from '@/utils/day-utils';
import { imgPath } from '@/utils/file-utils';

export type VersionItem = {
  id?: number;
  status: string;
  attachment?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fieldValues?: Record<string, unknown>;
};

type Props = {
  versions: VersionItem[];
  fieldConfig: DocumentFieldConfig[];
  canView?: boolean;
  isArabic?: boolean;
  showDivider?: boolean;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  return formatDayjs(value) || value;
};

const DocumentVersionHistory: React.FC<Props> = ({
  versions,
  fieldConfig,
  canView = true,
  isArabic = false,
  showDivider = false,
}) => {
  const [open, setOpen] = useState(false);

  if (!versions.length) return null;

  return (
    <Box sx={showDivider ? { mt: 2 } : {}}>
      {showDivider && <Divider sx={{ mb: 1 }} />}
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          color: 'text.secondary',
          width: 'fit-content',
          '&:hover': { color: 'text.primary' },
        }}
      >
        <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={16} />
        <Typography variant='caption'>
          {versions.length} previous version{versions.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      {open && (
        <Stack gap={0.75} mt={1}>
          {versions.map((v, i) => {
            const attachmentUrl = imgPath(v.attachment);
            const expired = isDateExpired(v.expiryDate);
            const fieldEntries = v.fieldValues ? Object.entries(v.fieldValues) : [];

            return (
              <Box
                key={v.id ?? i}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Icon
                  icon='mdi:file-clock-outline'
                  width={18}
                  color='gray'
                  style={{ marginTop: 2, flexShrink: 0 }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                      mb: 0.25,
                    }}
                  >
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      Version {versions.length - i}
                    </Typography>
                    <StatusChip status={v.status as any} />
                    {expired && (
                      <Chip
                        label='Expired'
                        size='small'
                        color='warning'
                        variant='outlined'
                        sx={{ height: 16, fontSize: 10 }}
                      />
                    )}
                  </Box>

                  <Typography variant='caption' color='text.secondary' noWrap display='block'>
                    {v.attachment?.split('/').pop() ?? 'No file'}
                  </Typography>

                  {v.documentNumber && (
                    <Typography variant='caption' color='text.secondary' display='block'>
                      Doc No: {v.documentNumber}
                    </Typography>
                  )}

                  {(v.issueDate || v.expiryDate) && (
                    <Typography variant='caption' color='text.secondary' display='block'>
                      {v.issueDate ? `Issued: ${formatDate(v.issueDate)}` : ''}
                      {v.issueDate && v.expiryDate ? ' · ' : ''}
                      {v.expiryDate ? `Expires: ${formatDate(v.expiryDate)}` : ''}
                    </Typography>
                  )}

                  {fieldEntries.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      {fieldEntries.map(([key, val]) => {
                        const cfg = fieldConfig.find((f) => f.fieldName === key);
                        const label =
                          isArabic && cfg?.labelAr ? cfg.labelAr : (cfg?.labelEn ?? key);
                        const display =
                          cfg?.fieldType === 'date' ? formatDate(String(val)) : String(val ?? '');
                        return (
                          <Typography
                            key={key}
                            variant='caption'
                            color='text.secondary'
                            display='block'
                          >
                            {label}: {display}
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                {canView && attachmentUrl && (
                  <Tooltip title='View'>
                    <IconButton
                      size='small'
                      component='a'
                      href={attachmentUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{ flexShrink: 0 }}
                    >
                      <Icon icon='mdi:eye-outline' width={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default DocumentVersionHistory;
