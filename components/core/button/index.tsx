"use client";

import Button from "@mui/material/Button";

import type { AppButtonProps } from "./types";

const variantMap = {
  filled: "contained",
  outlined: "outlined",
  text: "text",
  tonal: "contained",
} as const;

export default function AppButton({
  color,
  variant = "filled",
  sx,
  ...props
}: AppButtonProps) {
  return (
    <Button
      color={color ?? (variant === "tonal" ? "secondary" : "primary")}
      variant={variantMap[variant]}
      sx={{ borderRadius: 999, fontWeight: 800, ...sx }}
      {...props}
    />
  );
}
