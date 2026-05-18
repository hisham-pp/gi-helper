type ButtonMode =
  | 'view'
  | 'edit'
  | 'delete'
  | 'save'
  | 'link'
  | 'options'
  | 'convert'
  | 'copy'
  | 'send'
  | 'cancel'
  | 'track'
  | 'pdf';

export type Props = {
  actionFor: ButtonMode;
  onClick?: (id: number) => void;
  disabled?: boolean;
  id?: number;
  permissionKeys?: string[];
};
