"use client";

import TextField from "@mui/material/TextField";

import type { AppTextFieldProps } from "./type";

export default function AppTextField({
  fullWidth = true,
  max,
  min,
  readOnly,
  size,
  slotProps,
  sx,
  variant = "filled",
  ...props
}: AppTextFieldProps) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size ?? "medium"}
      slotProps={{
        ...slotProps,
        htmlInput: {
          ...slotProps?.htmlInput,
          max,
          min,
          readOnly,
        },
        input: {
          ...slotProps?.input,
        },
      }}
      sx={{
        "& .MuiInputBase-root": {
          borderRadius: variant === "outlined" ? 1 : "4px 4px 0 0",
          minHeight: 56,
        },
        ...sx,
      }}
      variant={variant}
      {...props}
    />
  );
}
