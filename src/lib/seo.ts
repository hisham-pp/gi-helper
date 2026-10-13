import type { Metadata } from "next";
import { SITE } from "./site";

/** Served by app/opengraph-image.tsx. */
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE.ogImageAlt,
};

interface PageSeo {
  /** Page title without the site name; the layout template appends it. */
  title: string;
  description: string;
  /** Canonical path, e.g. "/materials". */
  path: string;
  /** Use the title exactly as given (skip the "| GI Helper" template). */
  absoluteTitle?: boolean;
}

/**
 * Full metadata for an indexable page.
 * Next.js replaces (rather than merges) a parent's `openGraph` and `twitter`
 * objects when a page defines its own, so each page gets the complete set here,
 * including the share image.
 */
export function pageMetadata({ title, description, path, absoluteTitle }: PageSeo): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
