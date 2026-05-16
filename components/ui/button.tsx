import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text" | "elevated" | "tonal";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", ...props }, ref) => {
    const variants = {
      filled:
        "bg-primary text-primary-foreground hover:shadow-md active:bg-primary/90",
      tonal:
        "bg-secondary-container text-secondary-on-container hover:shadow-sm active:bg-secondary-container/90",
      outlined:
        "border border-outline text-primary hover:bg-primary/5 active:bg-primary/10",
      text: "text-primary hover:bg-primary/5 active:bg-primary/10",
      elevated:
        "bg-surface text-primary shadow-md hover:shadow-lg active:bg-primary/5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "disabled:opacity-38 inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
