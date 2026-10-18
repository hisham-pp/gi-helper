"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Eye, EyeOff, X, type LucideIcon } from "lucide-react";
import { playWiggle, usePrefersReducedMotion } from "@/lib/hooks";

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Icon at the start of the field (e.g. Search). */
  icon?: LucideIcon;
  /** Shows a clear (×) button while there's text. */
  clearable?: boolean;
  /** "pill" for search bars, "rounded" for form fields. */
  shape?: "rounded" | "pill";
  /** "sm" for compact bars inside modals. */
  size?: "md" | "sm";
  /** Classes for the wrapper (width, flex). */
  className?: string;
  /** Extra classes for the <input> itself. */
  inputClassName?: string;
}

/**
 * The app's text field: glass input with an optional leading icon, a clear
 * button and, for type="password", a show/hide toggle. Clearing and showing
 * or hiding give the field the glass UI's small squash-and-stretch.
 *
 * The buttons are centred with inset-y-0 + my-auto rather than a translate:
 * a pressed .glass-icon-btn scales, and when that replaced a -translate-y-1/2
 * the button jumped half its height on mouse-down, so clicks on its upper half
 * never registered (the "× doesn't clear" and "eye doesn't toggle" bugs).
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(function GlassInput(
  {
    value,
    onValueChange,
    icon: Icon,
    clearable = false,
    shape = "rounded",
    size = "md",
    type = "text",
    className = "",
    inputClassName = "",
    ...inputProps
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  /** The glass UI's squash-and-stretch, sized for a short field. */
  const wiggle = () => {
    if (!reducedMotion) playWiggle(fieldRef.current, "control");
  };

  const isPassword = type === "password";
  const showClear = clearable && value.length > 0;
  const buttons = Number(showClear) + Number(isPassword);

  const padStart = Icon ? "pl-10" : "pl-3.5";
  const padEnd = buttons === 2 ? "pr-[4.25rem]" : buttons === 1 ? "pr-10" : "pr-3.5";
  const sizing = size === "sm" ? "py-2 text-xs" : "py-2.5 text-sm";
  const radius = shape === "pill" ? "rounded-full" : "rounded-xl";

  return (
    <div ref={fieldRef} className={`relative ${className}`}>
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-white/50"
        />
      )}
      <input
        ref={inputRef}
        type={isPassword && revealed ? "text" : type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`glass-input w-full ${radius} ${sizing} ${padStart} ${padEnd} ${inputClassName}`}
        {...inputProps}
      />
      {buttons > 0 && (
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          {showClear && (
            <button
              type="button"
              onClick={() => {
                onValueChange("");
                inputRef.current?.focus();
                wiggle();
              }}
              className="glass-icon-btn h-7 w-7 rounded-full"
              aria-label="Clear"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => {
                setRevealed((shown) => !shown);
                wiggle();
              }}
              className="glass-icon-btn h-7 w-7 rounded-full bg-transparent shadow-none"
              aria-label={revealed ? "Hide" : "Show"}
              aria-pressed={revealed}
              title={revealed ? "Hide" : "Show"}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
});
