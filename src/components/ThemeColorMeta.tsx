"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { SITE } from "@/lib/seo";

/**
 * Updates the document's theme-color meta tag dynamically whenever the user
 * toggles between dark and light themes, so PWA title bars and mobile browser
 * status bars match the active background color in real-time.
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "light" ? SITE.themeColorLight : SITE.themeColor;
    let meta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
