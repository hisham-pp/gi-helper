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
const QUALITY_BY_PROFILE: Record<NetworkProfile, number> = {
  low: 40,
  medium: 65,
  high: 85,
};

export type CachedImageProps = Omit<ImageProps, "onError" | "quality"> & {
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

function isLocalImageApiSource(src: ImageProps["src"]) {
  return (
    typeof src === "string" &&
    (src.startsWith("/api/material-image/") ||
      src.startsWith("/api/recipe-image/"))
  );
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
    setCurrentSrc(src);
    setIsUsingFallback(false);
    setRetryAttempt(0);
    setRetryNonce(0);
  }, [src]);

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
      setCurrentSrc(src);
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

      if (sourceKey(currentSrc) === sourceKey(src)) {
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
        isLocalImageApiSource(currentSrc)
      }
    />
  );
}
