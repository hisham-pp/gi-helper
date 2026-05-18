'use client';

import React, { useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { PlateElement, type PlateElementProps } from '@udecode/plate/react';
import { Transforms } from 'slate';
import { type AttachmentElement as AttachmentType } from '../types';

// Don't narrow the `element` generic — Plate's PlateElementProps requires
// `element` to satisfy its `TElement` constraint (an indexable object).
// We cast to the richer AttachmentType inside the component instead.
type AttachmentProps = PlateElementProps;

const ALIGNMENT_MAP = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
} as const;

export const AttachmentBlock: React.FC<AttachmentProps> = ({ children, element, ...props }) => {
  const attachment = element as unknown as AttachmentType;
  const { url, alignment = 'left', width = '150px' } = attachment;

  const setAlignment = useCallback(
    (newAlignment: 'left' | 'center' | 'right') => {
      const editor = props.editor as any;
      const path = props.path;
      if (editor && path) {
        editor.setNodes({ alignment: newAlignment }, { at: path });
      }
    },
    [props.editor, props.path],
  );

  const removeAttachment = useCallback(() => {
    const editor = props.editor as any;
    const path = props.path;
    if (!editor || !path) return;
    Transforms.deselect(editor);
    Transforms.removeNodes(editor, { at: path });
  }, [props.editor, props.path]);

  return (
    <PlateElement {...props} element={element}>
      <Box
        contentEditable={false}
        sx={{
          display: 'flex',
          justifyContent: ALIGNMENT_MAP[alignment],
          my: 1.5,
          position: 'relative',
          '&:hover .attachment-controls': { opacity: 1 },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <img
            src={url}
            alt={attachment.fileName || 'attachment'}
            style={{
              width,
              maxWidth: '100%',
              display: 'block',
            }}
          />
          <Box
            className='attachment-controls'
            sx={{
              position: 'absolute',
              top: -32,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.25,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 2,
              px: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
          >
            <Tooltip title='Align left'>
              <IconButton
                size='small'
                onClick={() => setAlignment('left')}
                color={alignment === 'left' ? 'primary' : 'default'}
              >
                <Icon icon='material-symbols:format-align-left' width={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Align center'>
              <IconButton
                size='small'
                onClick={() => setAlignment('center')}
                color={alignment === 'center' ? 'primary' : 'default'}
              >
                <Icon icon='material-symbols:format-align-center' width={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title='Align right'>
              <IconButton
                size='small'
                onClick={() => setAlignment('right')}
                color={alignment === 'right' ? 'primary' : 'default'}
              >
                <Icon icon='material-symbols:format-align-right' width={16} />
              </IconButton>
            </Tooltip>
            <Box sx={{ width: '1px', bgcolor: 'divider', mx: 0.25, my: 0.5 }} />
            <Tooltip title='Remove attachment'>
              <IconButton
                size='small'
                onClick={removeAttachment}
                sx={{ '&:hover': { color: 'error.main' } }}
              >
                <Icon icon='material-symbols:delete-outline' width={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {children}
    </PlateElement>
  );
};
