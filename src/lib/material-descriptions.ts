"use client";

import { useEffect, useState } from "react";

/**
 * Material descriptions, fetched once from /api/material-descriptions (the
 * pages get the catalogs without them) and shared by every component.
 */

type Descriptions = Record<string, string>;

let cache: Descriptions | null = null;
let pending: Promise<Descriptions> | null = null;

export function loadMaterialDescriptions(): Promise<Descriptions> {
  if (cache) return Promise.resolve(cache);
  pending ??= fetch("/api/material-descriptions")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Descriptions>;
    })
    .then((data) => (cache = data))
    .catch((err) => {
      // Retried on the next call
      pending = null;
      throw err;
    });
  return pending;
}

/**
 * The descriptions once loaded (null until then). Loads when `when` is true,
 * or anyway once the browser is idle, so search and the modal rarely wait.
 */
export function useMaterialDescriptions(when = false): Descriptions | null {
  const [descriptions, setDescriptions] = useState<Descriptions | null>(cache);

  useEffect(() => {
    if (descriptions) return;
    let cancelled = false;
    const load = () => {
      loadMaterialDescriptions()
        .then((data) => !cancelled && setDescriptions(data))
        .catch(() => {});
    };
    if (when) {
      load();
      return () => {
        cancelled = true;
      };
    }
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(load, { timeout: 4000 }) : window.setTimeout(load, 2000);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [when, descriptions]);

  return descriptions;
}
