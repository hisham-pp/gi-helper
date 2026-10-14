"use client";

import React, { useState } from "react";

interface GameIconProps {
  /** A 128² WebP from public/images (weapons, artifacts, character avatars). */
  src: string | null | undefined;
  alt: string;
  /** Intrinsic size hint in px; set the rendered size with `className`. */
  size: number;
  className?: string;
  /** Rendered when there's no icon or it fails to load. */
  fallback?: React.ReactNode;
}

/** Lazy-loaded game icon, like MaterialThumb but for any icon URL. */
export function GameIcon({ src, alt, size, className = "", fallback = null }: GameIconProps) {
  // Remember which source failed so a changed source retries
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`object-contain ${className}`}
      onError={() => setFailedSrc(src)}
    />
  );
}
