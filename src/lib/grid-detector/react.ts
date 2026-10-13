"use client";

/**
 * React glue for grid detection resources that must be released explicitly:
 * object URLs, decoded bitmaps and the detection worker.
 */
import { useEffect, useRef, useState } from "react";
import { GridDetectionClient } from "./client";

/** Object URL for a blob, revoked when the blob changes or the component unmounts. */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

/** Decoded full-resolution bitmap (for original-quality crops), closed on change/unmount. */
export function useDecodedBitmap(blob: Blob | null | undefined): ImageBitmap | null {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  useEffect(() => {
    if (!blob) {
      setBitmap(null);
      return;
    }
    let disposed = false;
    let decoded: ImageBitmap | null = null;
    createImageBitmap(blob)
      .then((bmp) => {
        if (disposed) {
          bmp.close();
          return;
        }
        decoded = bmp;
        setBitmap(bmp);
      })
      .catch(() => setBitmap(null));
    return () => {
      disposed = true;
      decoded?.close();
      setBitmap(null);
    };
  }, [blob]);
  return bitmap;
}

/** One detection client per component lifetime; its worker is terminated on unmount. */
export function useGridDetectionClient(): GridDetectionClient {
  const ref = useRef<GridDetectionClient | null>(null);
  if (!ref.current) ref.current = new GridDetectionClient();
  useEffect(() => {
    const client = ref.current;
    return () => client?.dispose();
  }, []);
  return ref.current;
}
