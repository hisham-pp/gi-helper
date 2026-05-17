import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  variant?: "filled" | "outlined";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, variant = "outlined", ...props }, ref) => {
    return (
      <div className="group relative w-full">
        <textarea
          className={cn(
            "text-on-surface-variant peer flex min-h-[80px] w-full resize-y px-4 pb-2 pt-6 transition-all placeholder:text-transparent focus:outline-none focus:ring-0",
            variant === "outlined"
              ? "hover:border-on-surface rounded-md border border-outline bg-transparent focus:border-2 focus:border-primary"
              : "rounded-t-md border-b border-outline-variant bg-surface-variant hover:bg-surface-variant/80 focus:border-primary",
            className,
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        {label && (
          <label className="text-on-surface-variant pointer-events-none absolute left-4 top-2 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
            {label}
          </label>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
