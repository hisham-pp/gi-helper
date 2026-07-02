import { useCallback, useEffect, useState } from "react";
import { fetchWithCache, clearCacheEntry } from "./cache-utils";

type UseCachedDataOptions<T> = {
  url: string;
  cacheKey: string;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

type UseCachedDataResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
};

/**
 * React hook for fetching and caching data with 1-day expiry
 */
export function useCachedData<T>({
  url,
  cacheKey,
  enabled = true,
  onSuccess,
  onError,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchWithCache<T>(url, cacheKey, forceRefresh);
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Failed to fetch data");
        setError(errorObj);
        onError?.(errorObj);
      } finally {
        setIsLoading(false);
      }
    },
    [url, cacheKey, enabled, onSuccess, onError],
  );

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    clearCacheEntry(cacheKey);
    setData(null);
  }, [cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    clearCache,
  };
}
