"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Reset button entrance/exit: the width eases open (so the search box slides
 * aside instead of jumping) while the button pops in with the same springy
 * overshoot as the tab thumbs. Hover transitions of .glass-btn are kept.
 */
const RESET_TRANSITION = [
  "max-width 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "padding 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "margin 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "opacity 220ms ease",
  "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  "background 200ms ease",
  "color 200ms ease",
  "box-shadow 200ms ease",
].join(", ");

interface ResetFiltersButtonProps {
  /** Whether any filter is active; the button collapses away otherwise. */
  visible: boolean;
  onReset: () => void;
}

/**
 * Reset Filters for a row of filter controls with a `gap-2.5`. Always mounted
 * so it can animate in and out (collapsed to zero width, and inert, while
 * nothing is filtered).
 */
export function ResetFiltersButton({
  visible,
  onReset,
}: ResetFiltersButtonProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <button
      onClick={onReset}
      inert={!visible}
      aria-hidden={!visible}
      style={{
        transition: reducedMotion ? "none" : RESET_TRANSITION,
        // Cancels the row's gap-2.5 while collapsed
        marginLeft: visible ? 0 : "-0.625rem",
      }}
      className={`glass-btn glass-btn--danger shrink-0 gap-1 overflow-hidden whitespace-nowrap py-2 text-xs ${
        visible
          ? "max-w-[7rem] scale-100 px-3 opacity-100"
          : "pointer-events-none max-w-0 scale-75 px-0 opacity-0"
      }`}
      title="Reset all filters"
    >
      <RotateCcw className="h-3.5 w-3.5 shrink-0" />
      <span>Reset</span>
    </button>
  );
}
