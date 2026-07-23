const CACHE_PREFIX = "gi-helper-cache-";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const CACHE_VERSION_KEY = "gi-helper-cache-version";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

/**
 * Initialize cache version check. Clears all cached data if the build version
 * has changed since the last time the user visited. Call once at app startup.
 */
export function initCacheVersion(): void {
  if (typeof window === "undefined") return;

  try {
    const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);

    if (storedVersion !== buildId) {
      // Build version changed — wipe all static data caches
      clearAllCache();
      localStorage.setItem(CACHE_VERSION_KEY, buildId);
    }
  } catch (error) {
    console.error("Error initializing cache version:", error);
  }
}

/**
 * Get cached data from localStorage if it exists and hasn't expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

/**
 * Set data in localStorage with timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error("Error clearing cache entry:", error);
  }
}

/**
 * Clear all cached data for this app (excludes the version key)
 */
export function clearAllCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing all cache:", error);
  }
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(): Array<{
  key: string;
  age: number;
  expired: boolean;
}> {
  if (typeof window === "undefined") return [];

  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    return cacheKeys.map((key) => {
      const cached = localStorage.getItem(key);
      if (!cached) return { key, age: 0, expired: true };

      try {
        const entry: CacheEntry<unknown> = JSON.parse(cached);
        const age = Date.now() - entry.timestamp;
        return {
          key: key.replace(CACHE_PREFIX, ""),
          age,
          expired: age > CACHE_EXPIRY_MS,
        };
      } catch {
        return { key, age: 0, expired: true };
      }
    });
  } catch (error) {
    console.error("Error getting cache info:", error);
    return [];
  }
}

/**
 * Fetch JSON data with caching support
 * @param url - The URL to fetch data from
 * @param cacheKey - The key to use for caching
 * @param forceRefresh - If true, bypass cache and fetch fresh data
 */
export async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  forceRefresh = false,
): Promise<T> {
  // Try to get from cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedData<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  // Fetch fresh data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const data = await response.json();

  // Cache the fresh data
  setCachedData(cacheKey, data);

  return data;
}

/**
 * Update a single item inside a cached object's array property.
 * @param cacheKey - The key of the cached object
 * @param listKey - The property name inside the cached object that holds the array (e.g. "materials", "characters", "enemies")
 * @param itemId - The ID of the item to update
 * @param updatedItem - The updated item data
 */
export function updateSingleCachedItem<T extends { id: string }>(
  cacheKey: string,
  listKey: string,
  itemId: string,
  updatedItem: T,
): void {
  const cached = getCachedData<Record<string, T[]>>(cacheKey);
  if (!cached) return;

  const items: T[] = cached[listKey] ?? [];
  const updatedItems = items.map((item) =>
    item.id === itemId ? updatedItem : item,
  );
  setCachedData(cacheKey, { ...cached, [listKey]: updatedItems });
}

/**
 * Add a new item to a cached object's array property.
 * @param cacheKey - The key of the cached object
 * @param listKey - The property name inside the cached object that holds the array
 * @param newItem - The new item to prepend/append
 */
export function addSingleCachedItem<T extends { id: string }>(
  cacheKey: string,
  listKey: string,
  newItem: T,
): void {
  const cached = getCachedData<Record<string, T[]>>(cacheKey);
  if (!cached) return;

  const items: T[] = cached[listKey] ?? [];
  setCachedData(cacheKey, { ...cached, [listKey]: [...items, newItem] });
}
