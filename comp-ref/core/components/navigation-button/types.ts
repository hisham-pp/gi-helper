import { AppButtonProps } from '../button/types';

export type NavigationButtonProps = AppButtonProps & {
  href: string;
  loadingText?: string;
  openInNewTab?: boolean;
};
