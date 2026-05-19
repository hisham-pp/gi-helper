import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export type AppButtonVariant = "filled" | "outlined" | "text" | "tonal";

export type AppButtonProps = Omit<MuiButtonProps, "variant"> & {
  variant?: AppButtonVariant;
};
