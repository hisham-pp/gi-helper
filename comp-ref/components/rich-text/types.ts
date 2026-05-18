import { SxProps } from '@mui/material';

export type OuterHeaderProps = {
  header?: string;
  isPreview?: boolean;
  showPreviewButton?: boolean;
  togglePreview?: () => void;
};

export type RichTextEditorProps = {
  id: string;
  header?: string;
  value: string;
  onChange?: (html: string) => void;
  showPreviewButton?: boolean;
  isView?: boolean;
  minEditorHeight?: string;
  error?: boolean;
  helperText?: string;
  sx?: SxProps;
};
