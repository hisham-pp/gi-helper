/**
 * Release-note shapes and paging, without the file reading in ./versions.ts,
 * so client code (the "load older releases" list) can use them too.
 */

export const CHANGE_TYPES = ["new", "improved", "fixed", "removed"] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];

export interface ReleaseChange {
  type: ChangeType;
  text: string;
}

export interface VersionRelease {
  title: string;
  /** Release day as YYYY-MM-DD. */
  date: string;
  summary?: string;
  changes: ReleaseChange[];
  /** Dotted version, e.g. "0.0.2". */
  version: string;
  /** Folder name, e.g. "0-0-2"; also used as the page anchor. */
  slug: string;
}

/** Releases shown on /versions at first; older ones load 10 at a time. */
export const RELEASES_PER_PAGE = 10;

export interface ReleasePage {
  items: VersionRelease[];
  /** 1-based. */
  page: number;
  totalPages: number;
  total: number;
}

/** One page of releases (newest first), as served by /api/versions/[page]. */
export function releasePage(
  releases: VersionRelease[],
  page: number,
  perPage: number = RELEASES_PER_PAGE,
): ReleasePage {
  const totalPages = Math.max(1, Math.ceil(releases.length / perPage));
  return {
    items: releases.slice((page - 1) * perPage, page * perPage),
    page,
    totalPages,
    total: releases.length,
  };
}
