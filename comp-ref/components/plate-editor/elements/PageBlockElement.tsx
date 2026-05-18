'use client';

import React, { useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import {
  PlateElement,
  type PlateElementProps,
  useEditorRef,
  useEditorSelector,
  usePath,
} from '@udecode/plate/react';
import { Transforms } from 'slate';
import { type PageBlockElement as PageBlockType, type PageDirection } from '../types';

const A4_WIDTH = 794;
const A4_MIN_HEIGHT = 1123;

interface PageBlockProps extends PlateElementProps {
  letterheadUrl?: string;
  letterFooterUrl?: string;
}

export const PageBlockElement: React.FC<PageBlockProps> = ({
  children,
  element,
  letterheadUrl,
  letterFooterUrl,
  ...props
}) => {
  const editor = useEditorRef();
  const pageElement = element as unknown as PageBlockType;
  const { hasLetterhead, hasLetterFooter, direction = 'ltr' } = pageElement;
  // Use the reactive path hook so page numbers update after siblings are removed/inserted.
  const path = usePath();

  const toggleDirection = useCallback(() => {
    if (path) {
      const newDirection: PageDirection = direction === 'rtl' ? 'ltr' : 'rtl';
      (editor as any).setNodes({ direction: newDirection }, { at: path });
    }
  }, [editor, path, direction]);

  // Reactively compute the page number among page-block siblings so it
  // updates when pages are added/removed.
  const pageNumber = useEditorSelector(
    (ed: any) =>
      (ed.children as any[]).filter((c) => c?.type === 'page-block').indexOf(element) + 1 || 1,
    [element],
  );

  // Count total page-block nodes to prevent removing the only remaining page.
  const totalPages = useEditorSelector(
    (ed: any) => (ed.children as any[]).filter((c) => c?.type === 'page-block').length,
    [],
  );

  const removePage = useCallback(() => {
    if (!path || totalPages <= 1) return;
    Transforms.deselect(editor as any);
    Transforms.removeNodes(editor as any, { at: path });
  }, [editor, path, totalPages]);

  return (
    <PlateElement {...props} element={element}>
      <Box
        sx={{
          width: A4_WIDTH,
          minHeight: A4_MIN_HEIGHT,
          mx: 'auto',
          my: 3,
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
          borderRadius: '2px',
          position: 'relative',
          direction,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Page controls bar */}
        <Box
          contentEditable={false}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            userSelect: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon='material-symbols:description-outline' width={16} color='#9e9e9e' />
            <Typography variant='caption' color='text.secondary' fontWeight={500}>
              Page {pageNumber}
            </Typography>
            <Chip
              label={direction.toUpperCase()}
              size='small'
              variant='outlined'
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Tooltip title={`Switch to ${direction === 'rtl' ? 'LTR' : 'RTL'}`} arrow>
              <IconButton
                size='small'
                onClick={toggleDirection}
                sx={{ width: 26, height: 26, color: 'text.disabled' }}
              >
                <Icon
                  icon={
                    direction === 'rtl'
                      ? 'material-symbols:format-textdirection-r-to-l'
                      : 'material-symbols:format-textdirection-l-to-r'
                  }
                  width={15}
                />
              </IconButton>
            </Tooltip>
            {totalPages > 1 && (
              <Tooltip title={`Remove Page ${pageNumber}`} arrow>
                <IconButton
                  size='small'
                  onClick={removePage}
                  sx={{
                    width: 26,
                    height: 26,
                    color: 'text.disabled',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <Icon icon='material-symbols:delete-outline' width={15} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Letterhead area */}
        {hasLetterhead && letterheadUrl && (
          <Box
            contentEditable={false}
            sx={{
              width: '100%',
              textAlign: 'center',
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              userSelect: 'none',
            }}
          >
            <img src={letterheadUrl} alt='Letterhead' style={{ width: '100%', display: 'block' }} />
          </Box>
        )}

        {/* Page content */}
        <Box
          sx={{
            p: '48px 64px',
            minHeight: A4_MIN_HEIGHT - 100 - (hasLetterFooter && letterFooterUrl ? 80 : 0),
            fontSize: '14px',
            lineHeight: 1.7,
          }}
        >
          {children}
        </Box>

        {/* Letter Footer area */}
        {hasLetterFooter && letterFooterUrl && (
          <Box
            contentEditable={false}
            sx={{
              width: '100%',
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'grey.200',
              userSelect: 'none',
            }}
          >
            <img
              src={letterFooterUrl}
              alt='Letter Footer'
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        )}
      </Box>
    </PlateElement>
  );
};
