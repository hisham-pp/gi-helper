import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="group relative w-full">
        <textarea
          className={cn(
            "peer flex min-h-[80px] w-full rounded-t-md border-b border-outline-variant bg-surface-variant px-4 pt-6 pb-2 text-on-surface-variant transition-all placeholder:text-transparent hover:bg-surface-variant/80 focus:border-primary focus:outline-none focus:ring-0 resize-y",
            className
          )}
          ref={ref}
          placeholder={label}
          {...props}
        />
        {label && (
          <label
            className="pointer-events-none absolute left-4 top-2 text-xs text-on-surface-variant transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
