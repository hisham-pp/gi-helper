import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="group relative w-full">
        <input
          type={type}
          className={cn(
            "peer flex h-14 w-full rounded-t-md border-b border-outline-variant bg-surface-variant px-4 pt-4 text-on-surface-variant transition-all placeholder:text-transparent hover:bg-surface-variant/80 focus:border-primary focus:outline-none focus:ring-0",
            className
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        {label && (
          <label
            className="pointer-events-none absolute left-4 top-1 text-xs text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
