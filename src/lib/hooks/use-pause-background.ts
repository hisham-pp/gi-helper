"use client";

import { useEffect } from "react";

/** Number of mounted modals; nested ones (e.g. the material picker) stack. */
let openModals = 0;
let prevHtmlOverflow = "";
let prevBodyOverflow = "";
let prevHtmlOverscroll = "";
let prevBodyOverscroll = "";

/**
 * Marks `<html data-modal-open>` while the calling modal is mounted, which
 * pauses the animated background (see BackgroundEffects) and locks page
 * background scrolling so gestures inside modals (such as swiping cards)
 * do not scroll the underlying page.
 */
export function usePauseBackground(): void {
  useEffect(() => {
    if (openModals === 0) {
      prevHtmlOverflow = document.documentElement.style.overflow;
      prevBodyOverflow = document.body.style.overflow;
      prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      prevBodyOverscroll = document.body.style.overscrollBehavior;

      document.documentElement.setAttribute("data-modal-open", "");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
      document.body.style.overscrollBehavior = "none";
    }
    openModals++;

    return () => {
      openModals = Math.max(0, openModals - 1);
      if (openModals === 0) {
        document.documentElement.removeAttribute("data-modal-open");
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
        document.body.style.overscrollBehavior = prevBodyOverscroll;
      }
    };
  }, []);
}
