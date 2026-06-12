"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ImageProps } from "next/image";

type ImageQualityMode = "auto" | "low" | "medium" | "high";
type NetworkProfile = Exclude<ImageQualityMode, "auto">;
type NetworkInformationLike = EventTarget & {
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

const DEFAULT_FALLBACK_SRC = "/images/fallback-image.svg";
const CLIENT_IMAGE_CACHE_NAME = "gi-helper.images.v1";
const TRANSPARENT_PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
const QUALITY_BY_PROFILE: Record<NetworkProfile, number> = {
  low: 40,
  medium: 65,
  high: 85,
};

export type CachedImageProps = Omit<ImageProps, "onError" | "quality"> & {
  cacheKey?: string;
  cacheOnClient?: boolean;
  fallbackSrc?: ImageProps["src"];
  maxRetryDelayMs?: number;
  onError?: ImageProps["onError"];
  quality?: ImageProps["quality"];
  qualityMode?: ImageQualityMode;
  retryDelayMs?: number;
};

function getConnection() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function getNetworkProfile(): NetworkProfile {
  const connection = getConnection();

  if (!connection) {
    return "high";
  }

  if (connection.saveData) {
    return "low";
  }

  if (
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  ) {
    return "low";
  }

  if (
    connection.effectiveType === "3g" ||
    (typeof connection.downlink === "number" && connection.downlink < 1.5)
  ) {
    return "medium";
  }

  return "high";
}

function isSvgSource(src: ImageProps["src"]) {
  return (
    typeof src === "string" && src.toLowerCase().split("?")[0].endsWith(".svg")
  );
}

function isBrowserGeneratedSource(src: ImageProps["src"]) {
  return (
    typeof src === "string" &&
    (src.startsWith("blob:") || src.startsWith("data:"))
  );
}

function isLocalImageApiSource(src: ImageProps["src"]) {
  return (
    typeof src === "string" &&
    (src.startsWith("/api/material-image/") ||
      src.startsWith("/api/recipe-image/"))
  );
}

function getClientCacheSourceUrl(src: ImageProps["src"]) {
  if (
    typeof window === "undefined" ||
    typeof src !== "string" ||
    isBrowserGeneratedSource(src)
  ) {
    return undefined;
  }

  try {
    const url = new URL(src, window.location.origin);

    if (url.origin !== window.location.origin) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function hashCacheKey(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return `${Math.abs(hash)}-${value.length}`;
}

function getClientCacheRequest(cacheKey: string) {
  const url = new URL(
    `/__client-image-cache/${hashCacheKey(cacheKey)}`,
    window.location.origin,
  );

  return new Request(url.toString(), {
    method: "GET",
  });
}

function sourceKey(src: ImageProps["src"]) {
  if (typeof src === "string") {
    return src;
  }

  if ("src" in src) {
    return src.src;
  }

  return src.default.src;
}

export function CachedImage({
  cacheKey,
  cacheOnClient = true,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  maxRetryDelayMs = 30_000,
  onError,
  onLoad,
  quality,
  qualityMode = "auto",
  retryDelayMs = 4_000,
  src,
  unoptimized,
  ...props
}: CachedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [networkProfile, setNetworkProfile] = useState<NetworkProfile>("high");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    setIsUsingFallback(false);
    setRetryAttempt(0);
    setRetryNonce(0);
  }, [src]);

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | undefined;

    async function resolveCachedImage() {
      const cacheSourceUrl = getClientCacheSourceUrl(src);

      if (!cacheOnClient || !cacheSourceUrl || !("caches" in window)) {
        setCurrentSrc(src);
        return;
      }

      setCurrentSrc(TRANSPARENT_PLACEHOLDER_SRC);

      try {
        const cache = await caches.open(CLIENT_IMAGE_CACHE_NAME);
        const request = getClientCacheRequest(cacheKey ?? sourceKey(src));
        let response = await cache.match(request);

        if (!response) {
          response = await fetch(cacheSourceUrl, {
            cache: "force-cache",
            credentials: "same-origin",
          });

          if (!response.ok) {
            throw new Error(`Image request failed with ${response.status}.`);
          }

          await cache.put(request, response.clone());
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (isActive) {
          setCurrentSrc(objectUrl);
          setIsUsingFallback(false);
        }
      } catch {
        if (isActive) {
          setCurrentSrc(src);
        }
      }
    }

    void resolveCachedImage();

    return () => {
      isActive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [cacheKey, cacheOnClient, retryNonce, src]);

  useEffect(() => {
    const connection = getConnection();
    const updateNetworkProfile = () => setNetworkProfile(getNetworkProfile());

    updateNetworkProfile();
    connection?.addEventListener?.("change", updateNetworkProfile);

    return () => {
      connection?.removeEventListener?.("change", updateNetworkProfile);
    };
  }, []);

  useEffect(() => {
    if (!isUsingFallback || retryAttempt === 0) {
      return;
    }

    let hasRetried = false;
    const retryOriginal = () => {
      if (hasRetried) {
        return;
      }

      hasRetried = true;
      setRetryNonce((current) => current + 1);
      setIsUsingFallback(false);
    };
    const retryDelay = Math.min(
      retryDelayMs * 2 ** (retryAttempt - 1),
      maxRetryDelayMs,
    );
    const timeoutId = window.setTimeout(retryOriginal, retryDelay);

    window.addEventListener("online", retryOriginal, { once: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("online", retryOriginal);
    };
  }, [isUsingFallback, maxRetryDelayMs, retryAttempt, retryDelayMs, src]);

  const resolvedQuality = useMemo(() => {
    if (quality) {
      return quality;
    }

    const profile = qualityMode === "auto" ? networkProfile : qualityMode;
    return QUALITY_BY_PROFILE[profile];
  }, [networkProfile, quality, qualityMode]);

  const handleError = useCallback<NonNullable<ImageProps["onError"]>>(
    (event) => {
      onError?.(event);

      if (sourceKey(currentSrc) === sourceKey(fallbackSrc)) {
        return;
      }

      setCurrentSrc(fallbackSrc);
      setIsUsingFallback(true);
      setRetryAttempt((current) => current + 1);
    },
    [currentSrc, fallbackSrc, onError],
  );

  const handleLoad = useCallback<NonNullable<ImageProps["onLoad"]>>(
    (event) => {
      onLoad?.(event);

      if (
        sourceKey(currentSrc) === sourceKey(src) ||
        isBrowserGeneratedSource(currentSrc)
      ) {
        setIsUsingFallback(false);
        setRetryAttempt(0);
      }
    },
    [currentSrc, onLoad, src],
  );

  return (
    <Image
      {...props}
      key={`${sourceKey(currentSrc)}-${retryNonce}`}
      src={currentSrc}
      onError={handleError}
      onLoad={handleLoad}
      quality={resolvedQuality}
      unoptimized={
        unoptimized ||
        isSvgSource(currentSrc) ||
        isBrowserGeneratedSource(currentSrc) ||
        isLocalImageApiSource(currentSrc)
      }
    />
  );
}
