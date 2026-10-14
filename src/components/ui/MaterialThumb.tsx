"use client";

import React, { useState } from "react";
import { materialThumbUrl } from "@/lib/material-ui";

interface MaterialThumbProps {
  /** Material id; the 128² thumbnail is sharp up to 64 px on 2x screens. */
  id: string;
  alt: string;
  /** Intrinsic size hint in px; set the rendered size with `className`. */
  size: number;
  className?: string;
  /** Rendered instead of the image when it fails to load. */
  fallback?: React.ReactNode;
}

/** Small catalog icon for grids, lists and pickers: lazy-loaded and decoded off the main thread. */
export function MaterialThumb({ id, alt, size, className = "", fallback = null }: MaterialThumbProps) {
  // Remember which id failed so a slot reassigned to another material retries
  const [failedId, setFailedId] = useState<string | null>(null);
  if (failedId === id) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={materialThumbUrl(id)}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`object-contain ${className}`}
      onError={() => setFailedId(id)}
    />
  );
}
