'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEditorRef } from '@udecode/plate/react';
import { Editor } from 'slate';
import { Transforms } from 'slate';
import { ATTACHMENT, PAGE_BLOCK, PLACEHOLDER, type PlaceholderField } from '../types';

interface EditorToolbarProps {
  placeholders?: PlaceholderField[];
  onPreview?: () => void;
  onUploadAttachment?: () => void;
}

const ToolbarButton: React.FC<{
  icon: string;
  tooltip: string;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
}> = ({ icon, tooltip, onMouseDown, onClick, active }) => (
  <Tooltip title={tooltip} arrow>
    <IconButton
      size='small'
      onMouseDown={onMouseDown}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        width: 32,
        height: 32,
        bgcolor: active ? 'primary.light' : 'transparent',
        color: active ? 'primary.contrastText' : 'text.secondary',
        '&:hover': {
          bgcolor: active ? 'primary.main' : 'action.hover',
          color: active ? 'primary.contrastText' : 'text.primary',
        },
      }}
    >
      <Icon icon={icon} width={18} />
    </IconButton>
  </Tooltip>
);

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ placeholders = [], onPreview }) => {
  const editor = useEditorRef();
  const [placeholderAnchor, setPlaceholderAnchor] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState(0);

  const isMarkActive = useCallback(
    (mark: string): boolean => {
      try {
        const marks = Editor.marks(editor as any);
        return !!(marks as any)?.[mark];
      } catch {
        return false;
      }
    },
    [editor],
  );

  const toggleMark = useCallback(
    (e: React.MouseEvent, mark: string) => {
      e.preventDefault();
      e.stopPropagation();
      const marks = Editor.marks(editor as any);
      if ((marks as any)?.[mark]) {
        Editor.removeMark(editor as any, mark);
      } else {
        Editor.addMark(editor as any, mark, true);
      }
      forceUpdate((n) => n + 1);
    },
    [editor],
  );

  const insertPlaceholder = useCallback(
    (field: string, label: string) => {
      (editor as any).insertNode({
        type: PLACEHOLDER,
        field,
        label,
        children: [{ text: '' }],
      });
      (editor as any).insertText(' ');
      setPlaceholderAnchor(null);
    },
    [editor],
  );

  const addPage = useCallback(() => {
    const newPage = {
      type: PAGE_BLOCK,
      hasLetterhead: true,
      hasLetterFooter: true,
      direction: 'ltr',
      children: [{ type: 'p', children: [{ text: '' }] }],
    };
    // Flush any pending normalization first. Without this, a transient
    // root-level non-page-block node (e.g. an orphan paragraph awaiting
    // normalization) would be wrapped into its own page-block during the
    // insert below, causing two pages to appear for a single click.
    Editor.normalize(editor as any, { force: true });
    // Batch our insert so the normalizer doesn't interleave with it.
    Editor.withoutNormalizing(editor as any, () => {
      const at = [editor.children.length];
      Transforms.deselect(editor as any);
      Transforms.insertNodes(editor as any, newPage as any, { at });
      Transforms.select(editor as any, [...at, 0]);
    });
  }, [editor]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        (editor as any).insertNode({
          type: ATTACHMENT,
          url,
          fileName: file.name,
          alignment: 'left',
          width: '150px',
          children: [{ text: '' }],
        });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [editor],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 1,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Text formatting group */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          bgcolor: 'grey.50',
          borderRadius: 1.5,
          p: 0.5,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <ToolbarButton
          icon='material-symbols:format-bold'
          tooltip='Bold (Ctrl+B)'
          onMouseDown={(e) => toggleMark(e, 'bold')}
          active={isMarkActive('bold')}
        />
        <ToolbarButton
          icon='material-symbols:format-italic'
          tooltip='Italic (Ctrl+I)'
          onMouseDown={(e) => toggleMark(e, 'italic')}
          active={isMarkActive('italic')}
        />
        <ToolbarButton
          icon='material-symbols:format-underlined'
          tooltip='Underline (Ctrl+U)'
          onMouseDown={(e) => toggleMark(e, 'underline')}
          active={isMarkActive('underline')}
        />
      </Box>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      {/* Insert group */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          bgcolor: 'grey.50',
          borderRadius: 1.5,
          p: 0.5,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        {placeholders.length > 0 && (
          <ToolbarButton
            icon='material-symbols:data-object'
            tooltip='Insert placeholder'
            onClick={(e) => setPlaceholderAnchor(e.currentTarget)}
          />
        )}
        <ToolbarButton
          icon='material-symbols:image-outline'
          tooltip='Upload image / attachment'
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>

      <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

      {/* Page actions */}
      <Button
        size='small'
        variant='outlined'
        startIcon={<Icon icon='material-symbols:note-add-outline' width={16} />}
        onClick={addPage}
        sx={{
          textTransform: 'none',
          fontSize: '0.8rem',
          borderColor: 'grey.300',
          color: 'text.secondary',
          '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
        }}
      >
        Add Page
      </Button>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Preview */}
      {onPreview && (
        <Button
          size='small'
          variant='contained'
          disableElevation
          startIcon={<Icon icon='material-symbols:preview' width={16} />}
          onClick={onPreview}
          sx={{
            textTransform: 'none',
            fontSize: '0.8rem',
          }}
        >
          Preview
        </Button>
      )}

      {/* Placeholder menu */}
      <Menu
        anchorEl={placeholderAnchor}
        open={!!placeholderAnchor}
        onClose={() => setPlaceholderAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 360,
              minWidth: 260,
              mt: 1,
              borderRadius: 2,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='subtitle2' fontWeight={600}>
            Insert Placeholder
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Click to insert into template
          </Typography>
        </Box>
        {placeholders.map((p) => (
          <MenuItem
            key={p.field}
            onClick={() => insertPlaceholder(p.field, p.label)}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Icon icon='material-symbols:data-object' width={16} color='#1976d2' />
            </ListItemIcon>
            <ListItemText
              primary={p.label}
              primaryTypographyProps={{ fontSize: '0.85rem' }}
              secondary={p.category}
              secondaryTypographyProps={{ fontSize: '0.7rem' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
