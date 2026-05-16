import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <div className={cn("relative h-1 w-full overflow-hidden rounded-full bg-primary-container/30", className)}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
