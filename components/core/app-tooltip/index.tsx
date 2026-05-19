"use client";

import Tooltip from "@mui/material/Tooltip";
import type { TooltipProps } from "@mui/material/Tooltip";

export type AppTooltipProps = TooltipProps;

export default function AppTooltip(props: AppTooltipProps) {
  return <Tooltip arrow {...props} />;
}
