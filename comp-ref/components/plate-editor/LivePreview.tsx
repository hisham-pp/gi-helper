'use client';

import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  Typography,
} from '@mui/material';
import AppSwitch from '@/core/components/app-switch';
import { PAGE_BLOCK, PLACEHOLDER } from './types';

interface LivePreviewProps {
  open: boolean;
  onClose: () => void;
  value: any[];
  letterheadUrl?: string;
  letterFooterUrl?: string;
}

const SAMPLE_DATA: Record<string, string> = {
  // field format (path from API)
  '[Candidate Name]': 'Sarah Al-Rashid',
  '[Company Name]': 'Beework Technologies',
  '[Job Post]': 'Senior Software Engineer',
  '[Start Date]': '2026-04-15',
  '[CTC]': '1,200,000',
  '[Employment Type]': 'Full Time',
  '[Date]': new Date().toLocaleDateString(),
  '[Candidate Address]': '123 Innovation Street, Tech Park',
  '[Country]': 'UAE',
  '[Salary Chart]': '<table><tr><td>Basic</td><td>600,000</td></tr></table>',
  // label format
  'Candidate Name': 'Sarah Al-Rashid',
  'Company Name': 'Beework Technologies',
  'Job Post': 'Senior Software Engineer',
  'Start Date': '2026-04-15',
  CTC: '1,200,000',
  'Employment Type': 'Full Time',
  Date: new Date().toLocaleDateString(),
  'Candidate Address': '123 Innovation Street, Tech Park',
  Country: 'UAE',
  // Nationality & Branch
  '[Nationality]': 'Indian',
  Nationality: 'Indian',
  '[Branch]': 'Head Office',
  Branch: 'Head Office',
};

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const replaceTextPlaceholders = (text: string, sampleData?: Record<string, string>): string => {
  if (!sampleData) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    const val = sampleData[trimmed] || sampleData[`[${trimmed}]`];
    if (val) {
      return `<span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:3px;font-weight:500;">${escapeHtml(val)}</span>`;
    }
    return `<span style="background:#fff3e0;color:#e65100;padding:2px 6px;border-radius:3px;font-weight:500;">${match}</span>`;
  });
};

const renderNode = (node: any, sampleData?: Record<string, string>): string => {
  if (node.text !== undefined) {
    let text = escapeHtml(node.text || '');
    text = replaceTextPlaceholders(text, sampleData);
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    return text;
  }

  const children = (node.children || []).map((c: any) => renderNode(c, sampleData)).join('');

  switch (node.type) {
    case PLACEHOLDER: {
      const val =
        sampleData?.[node.field] || sampleData?.[node.label] || `{{${node.label || node.field}}}`;
      if (sampleData?.[node.field] || sampleData?.[node.label]) {
        return `<span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:3px;font-weight:500;">${escapeHtml(val)}</span>`;
      }
      return `<span style="background:#fff3e0;color:#e65100;padding:2px 6px;border-radius:3px;font-weight:500;">${escapeHtml(val)}</span>`;
    }
    case 'attachment': {
      const align =
        node.alignment === 'center' ? 'center' : node.alignment === 'right' ? 'right' : 'left';
      return `<div style="text-align:${align};margin:10px 0;"><img src="${node.url}" style="width:${node.width || 'auto'};max-width:100%;" /></div>`;
    }
    case 'h1':
      return `<h1 style="margin:0 0 12px;font-size:24px;">${children}</h1>`;
    case 'h2':
      return `<h2 style="margin:0 0 10px;font-size:20px;">${children}</h2>`;
    case 'h3':
      return `<h3 style="margin:0 0 8px;font-size:16px;">${children}</h3>`;
    case 'p':
    default:
      return `<p style="margin:0 0 6px;line-height:1.7;">${children || '&nbsp;'}</p>`;
  }
};

const renderPageHtml = (
  pageNode: any,
  sampleData?: Record<string, string>,
  letterheadUrl?: string,
  letterFooterUrl?: string,
): string => {
  const dir = pageNode.direction || 'ltr';
  const content = (pageNode.children || []).map((c: any) => renderNode(c, sampleData)).join('');
  const letterheadHtml =
    pageNode.hasLetterhead && letterheadUrl
      ? `<div style="width:100%;text-align:center;border-bottom:1px solid #eee;margin-bottom:16px;"><img src="${letterheadUrl}" style="width:100%;display:block;" /></div>`
      : '';
  const letterFooterHtml =
    pageNode.hasLetterFooter && letterFooterUrl
      ? `<div style="width:100%;text-align:center;position:absolute;bottom:0;left:0;right:0;"><img src="${letterFooterUrl}" style="width:100%;display:block;" /></div>`
      : '';
  return `<div style="direction:${dir};font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#333;position:relative;height:1123px;display:flex;flex-direction:column;">${letterheadHtml}<div style="padding:${pageNode.hasLetterhead && letterheadUrl ? '24px' : '48px'} 64px;flex:1;">${content}</div>${letterFooterHtml}</div>`;
};

export const LivePreview: React.FC<LivePreviewProps> = ({
  open,
  onClose,
  value,
  letterheadUrl,
  letterFooterUrl,
}) => {
  const [useSampleData, setUseSampleData] = useState(true);

  const pages = useMemo(() => {
    return (value || []).filter((node) => node.type === PAGE_BLOCK);
  }, [value]);

  const sampleData = useSampleData ? SAMPLE_DATA : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: 920,
          width: '100%',
          maxHeight: '95vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant='h6' fontWeight={600} fontSize='14px'>
            Live Preview
          </Typography>
          <Chip
            label={`${pages.length} page${pages.length !== 1 ? 's' : ''}`}
            size='small'
            variant='outlined'
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AppSwitch
            label='Sample data'
            checked={useSampleData}
            onChange={(e) => setUseSampleData(e.target.checked)}
          />
          <IconButton onClick={onClose} size='small'>
            <Icon icon='material-symbols:close' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#eef1f5', p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, mt: 2 }}>
          {pages.map((page, index) => (
            <Box key={index} sx={{ position: 'relative', mt: 3 }}>
              <Typography
                variant='caption'
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Page {index + 1}
              </Typography>
              <Box
                sx={{
                  width: 794,
                  minHeight: 1123,
                  bgcolor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{
                  __html: renderPageHtml(page, sampleData, letterheadUrl, letterFooterUrl),
                }}
              />
            </Box>
          ))}
          {pages.length === 0 && (
            <Typography color='text.secondary' sx={{ py: 8 }}>
              No pages to preview. Add content to see the preview.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
