import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "elevated", ...props }, ref) => {
    const variants = {
      elevated: "bg-surface shadow-md hover:shadow-lg",
      filled: "bg-surface-variant",
      outlined: "border border-outline-variant bg-surface"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
