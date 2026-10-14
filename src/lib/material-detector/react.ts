"use client";

/**
 * React glue for the scanning worker, which must be released explicitly.
 */
import { useEffect, useRef } from "react";
import { MaterialScanClient } from "./client";

/**
 * When the reference bank (a 2.3 MB atlas) starts downloading:
 * - `true`: on mount (tools that scan right away, e.g. the debug studio)
 * - `"idle"`: once the page has loaded and the browser is idle, so it never
 *   competes with the first render but is usually ready before the first scan
 * - `false`: on the first scan
 */
type Preload = boolean | "idle";

/** Runs `fn` after the load event, when the browser is idle (or 4 s at most). */
function whenIdleAfterLoad(fn: () => void): () => void {
  let cancelled = false;
  let idleId: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if (cancelled) return;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => !cancelled && fn(), { timeout: 4000 });
    } else {
      timer = setTimeout(() => !cancelled && fn(), 1500);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timer !== undefined) clearTimeout(timer);
  };
}

/**
 * One scan client per component lifetime; its worker is terminated on
 * unmount. See Preload for when the reference bank starts downloading;
 * `client.preload()` can also be called on intent (it only loads once).
 */
export function useMaterialScanClient({ preload = false }: { preload?: Preload } = {}): MaterialScanClient {
  const ref = useRef<MaterialScanClient | null>(null);
  if (!ref.current) ref.current = new MaterialScanClient();
  useEffect(() => {
    const client = ref.current;
    const cancelIdle =
      preload === "idle" ? whenIdleAfterLoad(() => client?.preload()) : undefined;
    if (preload === true) client?.preload();
    return () => {
      cancelIdle?.();
      client?.dispose();
    };
  }, [preload]);
  return ref.current;
}
