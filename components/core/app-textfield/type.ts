import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import type { InputHTMLAttributes } from "react";

export type AppTextFieldVariant = "filled" | "outlined";

export type AppTextFieldProps = Omit<MuiTextFieldProps, "variant"> & {
  max?: InputHTMLAttributes<HTMLInputElement>["max"];
  min?: InputHTMLAttributes<HTMLInputElement>["min"];
  readOnly?: boolean;
  variant?: AppTextFieldVariant;
};
