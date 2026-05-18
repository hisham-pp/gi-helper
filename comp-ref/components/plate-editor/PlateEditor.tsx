'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import {
  createPlateEditor,
  Plate,
  PlateContent,
  PlateElement,
  type PlateElementProps,
  PlateLeaf,
  type PlateLeafProps,
} from '@udecode/plate/react';
import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from '@udecode/plate-basic-marks/react';
import { AttachmentBlock } from './elements/AttachmentElement';
import { PageBlockElement } from './elements/PageBlockElement';
import { PlaceholderChip } from './elements/PlaceholderElement';
import { AttachmentPlugin } from './plugins/attachment-plugin';
import { PageBlockPlugin } from './plugins/page-block-plugin';
import { PlaceholderPlugin } from './plugins/placeholder-plugin';
import { EditorToolbar } from './toolbar/EditorToolbar';
import { LivePreview } from './LivePreview';
import { ATTACHMENT, PAGE_BLOCK, PLACEHOLDER, type PlateEditorProps } from './types';

const DocumentEditor: React.FC<PlateEditorProps> = ({
  id,
  value,
  onChange,
  placeholders = [],
  readOnly = false,
  letterheadUrl,
  letterFooterUrl,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useMemo(
    () =>
      createPlateEditor({
        id,
        plugins: [
          PageBlockPlugin,
          PlaceholderPlugin,
          AttachmentPlugin,
          BoldPlugin,
          ItalicPlugin,
          UnderlinePlugin,
        ],
        value,
        override: {
          components: {
            [PAGE_BLOCK]: (props: PlateElementProps) => (
              <PageBlockElement
                {...props}
                letterheadUrl={letterheadUrl}
                letterFooterUrl={letterFooterUrl}
              />
            ),
            [PLACEHOLDER]: PlaceholderChip,
            [ATTACHMENT]: AttachmentBlock,
            p: (props: PlateElementProps) => (
              <PlateElement {...props} as='p' style={{ margin: '0 0 6px 0', lineHeight: 1.7 }} />
            ),
            h1: (props: PlateElementProps) => (
              <PlateElement
                {...props}
                as='h1'
                style={{ margin: '0 0 12px 0', fontSize: '1.75rem', fontWeight: 600 }}
              />
            ),
            h2: (props: PlateElementProps) => (
              <PlateElement
                {...props}
                as='h2'
                style={{ margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 600 }}
              />
            ),
            h3: (props: PlateElementProps) => (
              <PlateElement
                {...props}
                as='h3'
                style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600 }}
              />
            ),
            bold: (props: PlateLeafProps) => <PlateLeaf {...props} as='strong' />,
            italic: (props: PlateLeafProps) => <PlateLeaf {...props} as='em' />,
            underline: (props: PlateLeafProps) => <PlateLeaf {...props} as='u' />,
          },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const handleChange = useCallback(
    ({ value: newValue }: { value: any[] }) => {
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Plate editor={editor} onChange={handleChange}>
        {!readOnly && (
          <EditorToolbar placeholders={placeholders} onPreview={() => setShowPreview(true)} />
        )}
        <Box
          sx={{
            bgcolor: '#eef1f5',
            maxHeight: '75vh',
            overflowY: 'auto',
            py: 3,
            px: 2,
          }}
        >
          <PlateContent
            readOnly={readOnly}
            placeholder='Start typing your template content...'
            style={{
              outline: 'none',
              minHeight: 400,
            }}
          />
        </Box>
      </Plate>

      <LivePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        value={value}
        letterheadUrl={letterheadUrl}
        letterFooterUrl={letterFooterUrl}
      />
    </Box>
  );
};

export default DocumentEditor;
