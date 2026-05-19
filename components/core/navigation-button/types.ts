import type { Route } from "next";
import type { ElementType, ReactNode } from "react";

export type NavigationButtonProps = {
  active?: boolean;
  component?: ElementType;
  disabled?: boolean;
  href?: Route;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
};
