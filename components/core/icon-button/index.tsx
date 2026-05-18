"use client";

import IconButton from "@mui/material/IconButton";

import AppTooltip from "@/components/core/app-tooltip";

import type { AppIconButtonProps } from "./types";

export default function AppIconButton({
  children,
  tooltip,
  sx,
  ...props
}: AppIconButtonProps) {
  const button = (
    <IconButton sx={{ borderRadius: 999, ...sx }} {...props}>
      {children}
    </IconButton>
  );

  if (!tooltip) return button;

  return <AppTooltip title={tooltip}>{button}</AppTooltip>;
}
