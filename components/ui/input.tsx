import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: "filled" | "outlined";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, variant = "outlined", ...props }, ref) => {
    const isOutlined = variant === "outlined";

    return (
      <div className="group relative w-full">
        <input
          type={type}
          className={cn(
            "text-on-surface peer flex h-14 w-full px-4 pt-4 transition-all placeholder:text-transparent focus:outline-none focus:ring-0",
            isOutlined
              ? "hover:border-on-surface rounded-md border border-outline bg-transparent focus:border-2 focus:border-primary"
              : "rounded-t-md border-b border-outline-variant bg-surface-variant hover:bg-surface-variant/80 focus:border-primary",
            className,
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "pointer-events-none absolute left-4 transition-all",
              isOutlined
                ? "top-1 -translate-y-1/2 bg-surface px-1 text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:bg-surface peer-focus:text-xs"
                : "top-1 text-xs peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs",
              "text-on-surface-variant peer-focus:text-primary",
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
