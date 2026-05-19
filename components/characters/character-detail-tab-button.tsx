"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CharacterDetailTabButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
        active
          ? "border-primary text-primary"
          : "text-on-surface-variant hover:text-on-surface border-transparent",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
