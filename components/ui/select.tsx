"use client";

import * as React from "react";
import ReactSelect, { type Props as SelectProps, type GroupBase, type StylesConfig } from "react-select";
import { cn } from "@/lib/utils";

export interface Option {
  readonly label: string;
  readonly value: string;
}

export interface CustomSelectProps extends Omit<SelectProps<Option, false, GroupBase<Option>>, "onChange" | "value"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
}

export function Select({ label, value, onChange, options, className, ...props }: CustomSelectProps) {
  const id = React.useId();
  const [isFocused, setIsFocused] = React.useState(false);
  
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
    control: (base, state) => ({
      ...base,
      height: "56px",
      backgroundColor: "rgb(var(--md-sys-color-surface-variant) / 1)",
      border: "none",
      borderBottom: state.isFocused 
        ? "2px solid rgb(var(--md-sys-color-primary) / 1)" 
        : "1px solid rgb(var(--md-sys-color-outline-variant) / 1)",
      borderRadius: "4px 4px 0 0",
      boxShadow: "none",
      paddingTop: "16px",
      paddingLeft: "4px",
      "&:hover": {
        backgroundColor: "rgb(var(--md-sys-color-surface-variant) / 0.8)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "rgb(var(--md-sys-color-on-surface-variant) / 1)",
      fontSize: "1rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "transparent",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "rgb(var(--md-sys-color-on-surface-variant) / 1)",
      "&:hover": {
        color: "rgb(var(--md-sys-color-on-surface-variant) / 1)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(var(--md-sys-color-surface) / 1)",
      borderRadius: "4px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
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
    <div className={cn("group relative w-full", className)}>
      <ReactSelect
        id={id}
        instanceId={id}
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
        <label
          className={cn(
            "pointer-events-none absolute left-4 transition-all z-10",
            selectedOption || isFocused
              ? "top-1 text-xs text-primary"
              : "top-4 text-base text-on-surface-variant"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
