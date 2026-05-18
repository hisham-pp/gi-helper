export const PAGE_BLOCK = 'page-block';
export const PLACEHOLDER = 'placeholder';
export const ATTACHMENT = 'attachment';

export type PageDirection = 'ltr' | 'rtl';

export interface PageBlockElement {
  type: typeof PAGE_BLOCK;
  hasLetterhead: boolean;
  hasLetterFooter: boolean;
  direction: PageDirection;
  children: any[];
}

export interface PlaceholderElement {
  type: typeof PLACEHOLDER;
  field: string;
  label: string;
  children: [{ text: '' }];
}

export interface AttachmentElement {
  type: typeof ATTACHMENT;
  url: string;
  fileName: string;
  alignment: 'left' | 'center' | 'right';
  width: string;
  children: [{ text: '' }];
}

export interface PlaceholderField {
  field: string;
  label: string;
  category: string;
}

export interface PlateEditorProps {
  id: string;
  value: any[];
  onChange: (value: any[]) => void;
  placeholders?: PlaceholderField[];
  readOnly?: boolean;
  letterheadUrl?: string;
  letterFooterUrl?: string;
}
