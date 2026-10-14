"use client";

import { Toaster } from "sonner";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

/**
 * App toasts as raised glass cards (the dialogs' glass), tinted per type
 * through --glass-accent. Sonner runs unstyled and keeps the stacking and
 * slide; they land with a squash-and-stretch (Toasts in styles/glass.css).
 */
export function GlassToaster() {
  return (
    <Toaster
      position="bottom-right"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-emerald-300" />,
        error: <CircleAlert className="h-4 w-4 text-rose-300" />,
        info: <Info className="h-4 w-4 text-cyan-300" />,
        warning: <TriangleAlert className="h-4 w-4 text-amber-300" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "glass-card glass-card--raised flex w-[var(--width)] items-center gap-3 px-4 py-3.5 text-[13px] text-white",
          content: "flex flex-col gap-0.5",
          title: "font-semibold leading-snug",
          description: "text-xs text-white/60",
          icon: "flex shrink-0 items-center justify-center",
          success: "[--glass-accent:52,211,153]",
          error: "[--glass-accent:251,113,133]",
          info: "[--glass-accent:103,232,249]",
          warning: "[--glass-accent:252,211,77]",
        },
      }}
    />
  );
}
