import type { Route } from "next";
import type { ElementType, ReactNode } from "react";

export type NavigationButtonProps = {
  active?: boolean;
  component?: ElementType;
  href?: Route;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
};
