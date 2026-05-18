import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "filled" | "outlined";
  helperText?: string;
  error?: boolean;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      type,
      label,
      variant = "filled",
      helperText,
      error,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const isOutlined = variant === "outlined";

    return (
      <div className="w-full">
        <div className="group relative w-full">
          <input
            id={inputId}
            type={type}
            aria-describedby={helperId}
            aria-invalid={error || undefined}
            className={cn(
              "text-on-surface peer flex h-14 w-full px-4 pt-4 transition-all placeholder:text-transparent focus:outline-none focus:ring-0",
              isOutlined
                ? "hover:border-on-surface rounded-md border border-outline bg-transparent focus:border-2 focus:border-primary"
                : "rounded-t-md border-b border-outline-variant bg-surface-variant hover:bg-surface-variant/80 focus:border-primary",
              error &&
                (isOutlined
                  ? "border-error focus:border-error"
                  : "border-error"),
              className,
            )}
            ref={ref}
            placeholder={label}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "pointer-events-none absolute left-4 transition-all",
                isOutlined
                  ? "top-1 -translate-y-1/2 bg-surface px-1 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:bg-surface peer-focus:text-xs"
                  : "top-1 text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs",
                error
                  ? "text-error peer-focus:text-error"
                  : "text-on-surface-variant peer-focus:text-primary",
              )}
            >
              {label}
            </label>
          )}
        </div>
        {helperText && (
          <p
            id={helperId}
            className={cn(
              "mt-1 px-4 text-xs",
              error ? "text-error" : "text-on-surface-variant",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export { TextField };
