export type Section = {
  id: string;
  title: string;
  component: React.ReactNode;
  permissionKey?: string;
};

export type ScrollableNavProps = {
  sections: Section[];
  contentHeight?: string;
  scrollOffset?: number;
  disableBodyScroll?: boolean;
};
