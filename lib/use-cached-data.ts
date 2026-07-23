import { useCallback, useEffect, useState } from "react";
import {
  fetchWithCache,
  clearCacheEntry,
  updateSingleCachedItem,
} from "./cache-utils";

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
  /**
   * Incrementally update a single item inside the cached dataset.
   * @param listKey - The property on the cached object that holds the array
   *   (e.g. "characters", "weapons", "enemies", "materials")
   * @param itemId - The ID of the item to update
   * @param updatedItem - The replacement item
   */
  updateItem: <U extends { id: string }>(
    listKey: string,
    itemId: string,
    updatedItem: U,
  ) => void;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, cacheKey, enabled],
  );

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    clearCacheEntry(cacheKey);
    setData(null);
  }, [cacheKey]);

  const updateItem = useCallback(
    <U extends { id: string }>(
      listKey: string,
      itemId: string,
      updatedItem: U,
    ) => {
      if (!data) return;

      // Patch localStorage
      updateSingleCachedItem(cacheKey, listKey, itemId, updatedItem);

      // Patch in-memory React state
      const dataAsRecord = data as Record<string, unknown>;
      const items = (dataAsRecord[listKey] ?? []) as U[];
      const updatedItems = items.map((item) =>
        item.id === itemId ? updatedItem : item,
      );
      setData({ ...dataAsRecord, [listKey]: updatedItems } as T);
    },
    [cacheKey, data],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    clearCache,
    updateItem,
  };
}
