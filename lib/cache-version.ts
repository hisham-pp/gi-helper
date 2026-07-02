"use client";

import { initCacheVersion } from "./cache-utils";

/**
 * Re-export for use in client components. Call once at app startup.
 * Compares the stored cache version against the current build ID and
 * clears all static data caches if the build has changed.
 */
export { initCacheVersion };
