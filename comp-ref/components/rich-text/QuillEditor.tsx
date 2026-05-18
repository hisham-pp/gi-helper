'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormHelperText, Stack, useTheme } from '@mui/material';
import OuterHeader from './outer-header/OuterHeader';
import { StyledEditorWrapper } from './outer-header/styled-components';
import { RichTextEditorProps } from './types';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  header,
  value,
  onChange,
  isView = false,
  showPreviewButton = true,
  minEditorHeight,
  helperText,
  sx,
}) => {
  const theme = useTheme();

  const [isPreview, setIsPreview] = useState(false);

  const quillRef = useRef<HTMLDivElement | null>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image'],
    ],
  };

  const handleEditorChange = useCallback(
    (newValue: string) => {
      onChange?.(newValue === '<p><br></p>' ? '' : newValue);
    },
    [onChange],
  );

  const togglePreview = () => {
    setIsPreview((prev) => !prev);
  };

  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.querySelector('.ql-toolbar');
      if (toolbar) {
        (toolbar as HTMLElement).style.pointerEvents = isView ? 'none' : 'auto';
        (toolbar as HTMLElement).style.opacity = isView ? '0.6' : '1';
      }
    }
  }, [isView]);

  return (
    <Stack spacing={2} sx={{ width: '100%', ...sx }}>
      <OuterHeader
        header={header}
        showPreviewButton={showPreviewButton}
        isPreview={isPreview}
        togglePreview={togglePreview}
      />

      {isPreview ? (
        <Stack spacing={2} border={1} padding={2}>
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </Stack>
      ) : (
        <>
          <StyledEditorWrapper minEditorHeight={minEditorHeight}>
            <div ref={quillRef} style={{ width: '100%' }}>
              <QuillEditor
                value={value || ''}
                onChange={handleEditorChange}
                modules={modules}
                theme='snow'
                id={id}
                readOnly={isView}
                className='quill-sticky-toolbar'
                style={{ width: '100%' }}
              />
            </div>
            {helperText && (
              <FormHelperText sx={{ ml: 3, color: theme.palette.error.main }}>
                {helperText}
              </FormHelperText>
            )}
          </StyledEditorWrapper>
        </>
      )}
    </Stack>
  );
};

export default RichTextEditor;
