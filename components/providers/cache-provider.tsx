"use client";

import { useEffect } from "react";
import { initCacheVersion } from "@/lib/cache-version";

/**
 * Runs cache version check once per client session.
 * If the app has been redeployed with new static data, this will
 * clear all stale localStorage caches so fresh data is fetched.
 */
export function CacheProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initCacheVersion();
  }, []);

  return <>{children}</>;
}
