"use client";

/**
 * React glue for the scanning worker, which must be released explicitly.
 */
import { useEffect, useRef } from "react";
import { MaterialScanClient } from "./client";

/**
 * One scan client per component lifetime; its worker is terminated on
 * unmount. With `preload`, the reference bank starts downloading on mount.
 */
export function useMaterialScanClient({ preload = false }: { preload?: boolean } = {}): MaterialScanClient {
  const ref = useRef<MaterialScanClient | null>(null);
  if (!ref.current) ref.current = new MaterialScanClient();
  useEffect(() => {
    const client = ref.current;
    if (preload) client?.preload();
    return () => client?.dispose();
  }, [preload]);
  return ref.current;
}
