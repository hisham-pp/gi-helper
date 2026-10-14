"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const OPEN_MS = 600;
const CLOSE_MS = 300;
const BACKDROP_IN_MS = 200;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Opens and closes a modal with the page switch's squash-and-stretch
 * (components/layout/PageTransition): the dialog lands with a squash while
 * the backdrop fades in, and on close it squashes and shrinks away as the
 * backdrop fades out. Attach `dialogRef` and `backdropRef`, and close through
 * `close` (safe as an onClick handler) instead of calling `onClose` directly;
 * `closeThen(fn)` runs `fn` instead of `onClose` once the exit has played
 * (e.g. confirm, which also unmounts the modal). Pass `ready = false` while
 * the modal still renders nothing (e.g. settings loading), so the entrance
 * plays when the dialog appears.
 */
export function useModalMotion(onClose: () => void, ready = true) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Layout effect, so the first painted frame is already animating
  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion()) return;

    // No fill: once finished the dialog drops its transform, which would
    // otherwise trap fixed overlays (e.g. the nested material picker) inside it.
    const dialog = dialogRef.current?.animate(
      [
        { transform: "scale(0.97)" },
        { transform: "scale(1.012, 0.985)", offset: 0.45 },
        { transform: "scale(0.996, 1.006)", offset: 0.75 },
        { transform: "scale(1)" },
      ],
      { duration: OPEN_MS, easing: "ease-out" },
    );
    const backdrop = backdropRef.current?.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: BACKDROP_IN_MS,
        easing: "ease-out",
      },
    );
    return () => {
      dialog?.cancel();
      backdrop?.cancel();
    };
  }, [ready]);

  const closeThen = useCallback((after: () => void) => {
    if (closingRef.current) return;
    if (prefersReducedMotion()) {
      after();
      return;
    }
    closingRef.current = true;

    const dialog = dialogRef.current;
    const backdrop = backdropRef.current;
    // Ignore further clicks while it leaves
    if (dialog) dialog.style.pointerEvents = "none";
    if (backdrop) backdrop.style.pointerEvents = "none";

    // Stays hidden (fill) until the parent unmounts it
    dialog?.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(1.012, 0.985)", opacity: 1, offset: 0.4 },
        { transform: "scale(0.94)", opacity: 0 },
      ],
      { duration: CLOSE_MS, easing: "ease-in", fill: "forwards" },
    );
    backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: CLOSE_MS,
      easing: "ease-in",
      fill: "forwards",
    });
    // A timer, not animation.finished: that never settles while the page isn't painting
    window.setTimeout(after, CLOSE_MS);
  }, []);

  const close = useCallback(() => closeThen(onClose), [closeThen, onClose]);

  return { dialogRef, backdropRef, close, closeThen };
}
