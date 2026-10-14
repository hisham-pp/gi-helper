"use client";

import React, { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Left-to-right order of the pages (top-bar links, then the footer's About), for the slide direction. */
const PAGE_ORDER = ["/", "/inventory", "/materials", "/versions", "/about"];

/** Page shown before the current one; survives remounts because it lives outside React. */
let lastPathname: string | null = null;

/**
 * Wraps each page (mounted by app/(site)/template.tsx, which remounts on every
 * navigation) and plays the scanner tabs' squash-and-stretch on page switches,
 * nudged in the direction of travel. Skipped on the first load and under
 * reduced motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  // Read once per mount, so Strict Mode's effect re-run still sees the previous page
  const fromRef = useRef<string | null | undefined>(undefined);

  // Layout effect, so the first frame of the new page is already animating
  useLayoutEffect(() => {
    if (fromRef.current === undefined) {
      fromRef.current = lastPathname;
      lastPathname = pathname;
    }
    const from = fromRef.current;
    if (!from || from === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fromIndex = PAGE_ORDER.indexOf(from);
    const toIndex = PAGE_ORDER.indexOf(pathname);
    const dir =
      fromIndex < 0 || toIndex < 0 ? 0 : Math.sign(toIndex - fromIndex);

    // No fill: once finished the transform is dropped, so it can't trap fixed
    // overlays or backdrop blurs inside the page.
    const animation = ref.current?.animate(
      [
        { transform: `translateX(${14 * dir}px) scale(0.97)` },
        {
          transform: `translateX(${-3 * dir}px) scale(1.012, 0.985)`,
          offset: 0.45,
        },
        { transform: "translateX(0) scale(0.996, 1.006)", offset: 0.75 },
        { transform: "translateX(0) scale(1)" },
      ],
      { duration: 600, easing: "ease-out" },
    );
    return () => animation?.cancel();
  }, [pathname]);

  return (
    // Squash around the middle of the screen, not the middle of a long page
    <div
      ref={ref}
      className="flex w-full flex-1 flex-col"
      style={{ transformOrigin: "50% 40vh" }}
    >
      {children}
    </div>
  );
}
