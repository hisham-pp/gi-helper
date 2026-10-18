"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePrefersReducedMotion, useWiggleOnChange } from "@/lib/hooks";

interface PaginationBarProps {
  /** Current page, 1-based and already clamped to `totalPages`. */
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

/**
 * "Showing 1 - 36 of 481" with Prev/Next and page numbers (first, last and two
 * either side of the current one). Wiggles when the page changes; renders
 * nothing when everything fits on one page.
 */
export function PaginationBar({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  useWiggleOnChange(ref, page, usePrefersReducedMotion());

  if (totalPages <= 1) return null;

  return (
    <div
      ref={ref}
      className="glass-card flex flex-col items-center justify-between gap-4 p-4 sm:flex-row"
    >
      <span className="text-xs text-white/60">
        Showing{" "}
        <strong className="text-white">{(page - 1) * pageSize + 1}</strong> -{" "}
        <strong className="text-white">
          {Math.min(page * pageSize, totalItems)}
        </strong>{" "}
        of <strong className="text-white">{totalItems}</strong>
      </span>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="glass-chip h-8 gap-1 px-3 text-xs font-semibold"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              return Math.abs(p - page) <= 2;
            })
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <span className="px-1 text-xs text-white/40">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    aria-current={page === p ? "page" : undefined}
                    data-active={page === p}
                    className="glass-chip h-8 w-8 justify-center text-xs font-bold"
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="glass-chip h-8 gap-1 px-3 text-xs font-semibold"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
