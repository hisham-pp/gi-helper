"use client";

import { useEffect } from "react";

/** Number of mounted modals; nested ones (e.g. the material picker) stack. */
let openModals = 0;

/**
 * Marks `<html data-modal-open>` while the calling modal is mounted, which
 * pauses the animated background (see BackgroundEffects). The background sits
 * under the modal's full-screen blur, so animating it only costs GPU time.
 */
export function usePauseBackground(): void {
  useEffect(() => {
    openModals++;
    document.documentElement.setAttribute("data-modal-open", "");
    return () => {
      openModals = Math.max(0, openModals - 1);
      if (openModals === 0) document.documentElement.removeAttribute("data-modal-open");
    };
  }, []);
}
