"use client";

import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import { useTheme } from "@mui/material/styles";
import ReactSelect, {
  type GroupBase,
  type SelectInstance,
  type StylesConfig,
} from "react-select";

import { cn } from "@/lib/utils";

import type { AppSelectOption, AppSelectProps } from "./type";

const outlinedRadius = "20px";
const filledRadius = "4px 4px 0 0";

const AppSelect = React.forwardRef<
  SelectInstance<AppSelectOption, false, GroupBase<AppSelectOption>>,
  AppSelectProps
>(
  (
    {
      label,
      value,
      onChange,
      options,
      className,
      variant = "filled",
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const theme = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);

    const selectedOption = React.useMemo(
      () => options.find((opt) => opt.value === value) || null,
      [options, value],
    );
    const isLabelShrunk = Boolean(selectedOption) || isFocused;
    const filledBackground =
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.09)"
        : "rgba(0, 0, 0, 0.06)";
    const filledHoverBackground =
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.13)"
        : "rgba(0, 0, 0, 0.09)";

    const customStyles: StylesConfig<
      AppSelectOption,
      false,
      GroupBase<AppSelectOption>
    > = {
      control: (base, state) => ({
        ...base,
        minHeight: "56px",
        backgroundColor:
          variant === "outlined" ? "transparent" : filledBackground,
        border:
          variant === "outlined"
            ? state.isFocused
              ? "2px solid rgb(var(--md-sys-color-primary) / 1)"
              : "1px solid rgb(var(--md-sys-color-outline) / 1)"
            : "none",
        borderBottom:
          variant === "filled"
            ? state.isFocused
              ? "2px solid rgb(var(--md-sys-color-primary) / 1)"
              : "1px solid rgb(var(--md-sys-color-outline-variant) / 1)"
            : undefined,
        borderRadius: variant === "outlined" ? outlinedRadius : filledRadius,
        boxShadow: "none",
        cursor: "pointer",
        fontSize: "1rem",
        transition:
          "border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-width 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor:
            variant === "outlined"
              ? "rgb(var(--md-sys-color-surface-variant) / 0.05)"
              : filledHoverBackground,
          borderColor:
            variant === "outlined" && !state.isFocused
              ? "rgb(var(--md-sys-color-on-surface) / 1)"
              : undefined,
        },
      }),
      valueContainer: (base) => ({
        ...base,
        minHeight: "54px",
        padding:
          variant === "outlined"
            ? "16.5px 14px 0"
            : isLabelShrunk
              ? "20px 12px 4px"
              : "16px 12px 0",
      }),
      input: (base) => ({
        ...base,
        color: "rgb(var(--md-sys-color-on-surface) / 1)",
        margin: 0,
        padding: 0,
      }),
      singleValue: (base) => ({
        ...base,
        color: "rgb(var(--md-sys-color-on-surface) / 1)",
        fontSize: "1rem",
        margin: 0,
      }),
      placeholder: (base) => ({
        ...base,
        color: "transparent",
        margin: 0,
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "rgb(var(--md-sys-color-on-surface-variant) / 1)",
        paddingRight: "12px",
        "&:hover": {
          color: "rgb(var(--md-sys-color-on-surface-variant) / 1)",
        },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: "rgb(var(--md-sys-color-surface) / 1)",
        borderRadius: outlinedRadius,
        boxShadow:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        overflow: "hidden",
        zIndex: 50,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "rgb(var(--md-sys-color-primary-container) / 1)"
          : state.isFocused
            ? "rgb(var(--md-sys-color-surface-variant) / 1)"
            : "transparent",
        color: state.isSelected
          ? "rgb(var(--md-sys-color-on-primary-container) / 1)"
          : "rgb(var(--md-sys-color-on-surface) / 1)",
        "&:active": {
          backgroundColor: "rgb(var(--md-sys-color-primary-container) / 0.8)",
        },
      }),
    };

    return (
      <div className={cn("relative w-full", className)}>
        <ReactSelect
          id={id}
          inputId={id}
          instanceId={id}
          ref={ref}
          styles={customStyles}
          options={options}
          value={selectedOption}
          onChange={(option) => onChange?.(option?.value || "")}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={label}
          isSearchable={props.isSearchable ?? true}
          {...props}
        />
        {label && (
          <InputLabel
            focused={isFocused}
            htmlFor={id}
            shrink={isLabelShrunk}
            sx={{
              backgroundColor:
                variant === "outlined" && isLabelShrunk
                  ? "background.paper"
                  : "transparent",
              left: 0,
              pointerEvents: "none",
              position: "absolute",
              px: variant === "outlined" && isLabelShrunk ? 0.5 : 0,
              top: 0,
              transform:
                variant === "outlined"
                  ? isLabelShrunk
                    ? "translate(14px, -9px) scale(0.75)"
                    : "translate(14px, 16px) scale(1)"
                  : isLabelShrunk
                    ? "translate(12px, 7px) scale(0.75)"
                    : "translate(12px, 16px) scale(1)",
              transformOrigin: "top left",
              zIndex: 1,
            }}
            variant={variant}
          >
            {label}
          </InputLabel>
        )}
      </div>
    );
  },
);

AppSelect.displayName = "AppSelect";

export { AppSelect as Select };
export type { AppSelectOption, AppSelectProps } from "./type";
export default AppSelect;
