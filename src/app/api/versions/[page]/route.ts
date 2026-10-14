import { NextResponse } from "next/server";
import { getVersions, RELEASES_PER_PAGE, releasePage } from "@/lib/versions";

/*
 * GET /api/versions/[page]: older releases for /versions, 10 per page (page 1
 * is already on the page). Built as static JSON at build time, like the page
 * itself, so loading more never reads files at runtime.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const pages = Math.ceil(getVersions().length / RELEASES_PER_PAGE);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return NextResponse.json(releasePage(getVersions(), Number(page)));
}
