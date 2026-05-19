"use client";

import { forwardRef } from "react";
import TextField from "@mui/material/TextField";

import type { AppTextFieldProps } from "./type";

const AppTextField = forwardRef<HTMLInputElement, AppTextFieldProps>(
  (
    {
      fullWidth = true,
      max,
      min,
      readOnly,
      size,
      slotProps,
      sx,
      variant = "filled",
      ...props
    },
    ref,
  ) => {
    return (
      <TextField
        fullWidth={fullWidth}
        inputRef={ref}
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
  },
);

AppTextField.displayName = "AppTextField";

export default AppTextField;
