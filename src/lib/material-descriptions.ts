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
 * The descriptions once loaded (null until then). They load the first time
 * `when` is true (a search, the detail modal), not before: most visits never
 * need them, and they're most of the catalogs' bytes.
 */
export function useMaterialDescriptions(when: boolean): Descriptions | null {
  const [descriptions, setDescriptions] = useState<Descriptions | null>(cache);

  useEffect(() => {
    if (descriptions || !when) return;
    let cancelled = false;
    loadMaterialDescriptions()
      .then((data) => !cancelled && setDescriptions(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [when, descriptions]);

  return descriptions;
}
