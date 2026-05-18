import { MasterEntity } from '@/types/master';

export type MasterSimpleCrudProps = {
  open: boolean;
  title?: string;
  values?: MasterEntity | null;
  loading?: boolean;
  updating?: boolean;
  isShowPrivilege?: boolean;
  onClose: () => void;
  onSubmit?: (values: MasterEntity) => void;
};
