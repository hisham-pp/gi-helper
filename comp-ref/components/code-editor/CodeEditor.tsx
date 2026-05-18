'use client';

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  styled,
  TextField,
  Toolbar,
  Tooltip,
} from '@mui/material';
import * as monaco from 'monaco-editor';
import Icon from '@/core/components/icon';

const EditorWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const EditorToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '48px',
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
  padding: `${theme.spacing(1)} ${theme.spacing(2)} !important`,
}));

const SearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  flex: 1,
}));

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: 'html' | 'javascript' | 'typescript' | 'json' | 'css';
  height?: string | number;
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  minimap?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'html',
  height = '600px',
  theme = 'light',
  readOnly = false,
  minimap = true,
  formatOnPaste = true,
  formatOnType = false,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Configure HTML language features
      if (language === 'html') {
        monaco.languages.html.htmlDefaults.setOptions({
          format: {
            tabSize: 2,
            insertSpaces: true,
            wrapLineLength: 120,
            wrapAttributes: 'auto',
            endWithNewline: true,
            unformatted: '',
            contentUnformatted: 'pre,code,textarea',
            indentInnerHtml: false,
            preserveNewLines: true,
            maxPreserveNewLines: undefined,
            indentHandlebars: true,
            extraLiners: 'head, body, /html',
          },
          suggest: {
            html5: true,
          },
        });
      }

      // Add custom keyboard shortcuts
      editor.addAction({
        id: 'format-document',
        label: 'Format Document',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
        run: (editor) => {
          editor.getAction('editor.action.formatDocument')?.run();
        },
      });

      // Add keyboard shortcut for custom search
      editor.addAction({
        id: 'open-search',
        label: 'Open Search',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
        run: () => {
          setShowSearch(true);
        },
      });
    },
    [language],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value);
    },
    [onChange],
  );

  const handleSearch = useCallback(() => {
    if (editorRef.current && searchText) {
      editorRef.current.trigger('search', 'actions.find', {
        searchString: searchText,
      });
    }
  }, [searchText]);

  const handleReplace = useCallback(() => {
    if (editorRef.current && searchText) {
      const model = editorRef.current.getModel();
      if (model) {
        const selection = editorRef.current.getSelection();
        if (selection && !selection.isEmpty()) {
          editorRef.current.executeEdits('replace', [
            {
              range: selection,
              text: replaceText,
            },
          ]);
        }
      }
    }
  }, [searchText, replaceText]);

  const handleReplaceAll = useCallback(() => {
    if (editorRef.current && searchText && replaceText) {
      const model = editorRef.current.getModel();
      if (model) {
        const content = model.getValue();
        const newContent = content.replace(new RegExp(searchText, 'g'), replaceText);
        model.setValue(newContent);
      }
    }
  }, [searchText, replaceText]);

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const editorOptions = useMemo(
    () => ({
      readOnly,
      minimap: {
        enabled: minimap,
      },
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      wordWrap: 'on' as const,
      lineNumbers: 'on' as const,
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderWhitespace: 'selection' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste,
      formatOnType,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on' as const,
      tabCompletion: 'on' as const,
      wordBasedSuggestions: 'matchingDocuments' as const,
      parameterHints: {
        enabled: true,
      },
      autoClosingBrackets: 'always' as const,
      autoClosingQuotes: 'always' as const,
      autoIndent: 'full' as const,
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth' as const,
      cursorSmoothCaretAnimation: 'on' as const,
      bracketPairColorization: {
        enabled: true,
      },
    }),
    [readOnly, minimap, formatOnPaste, formatOnType],
  );

  const loadingComponent = useMemo(
    () => (
      <Box display='flex' justifyContent='center' alignItems='center' height={height}>
        <CircularProgress />
      </Box>
    ),
    [height],
  );

  return (
    <EditorWrapper>
      {showSearch && (
        <EditorToolbar>
          <SearchBar>
            <TextField
              size='small'
              placeholder='Find'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='material-symbols:search' fontSize='small' />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              size='small'
              placeholder='Replace'
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Tooltip title='Replace'>
              <IconButton size='small' onClick={handleReplace} disabled={!searchText}>
                <Icon icon='material-symbols:find-replace' fontSize='small' />
              </IconButton>
            </Tooltip>
            <Button
              variant='outlined'
              size='small'
              onClick={handleReplaceAll}
              disabled={!searchText || !replaceText}
            >
              Replace All
            </Button>
          </SearchBar>
          <Tooltip title='Format Document'>
            <IconButton size='small' onClick={handleFormat}>
              <Icon icon='material-symbols:format-align-left' fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Close'>
            <IconButton size='small' onClick={() => setShowSearch(false)}>
              <Icon icon='material-symbols:close' fontSize='small' />
            </IconButton>
          </Tooltip>
        </EditorToolbar>
      )}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={editorOptions}
        loading={loadingComponent}
      />
    </EditorWrapper>
  );
};

export default memo(CodeEditor);
