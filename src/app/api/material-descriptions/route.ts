import { NextResponse } from "next/server";
import { getDirectoryMaterials } from "@/lib/materials";

/*
 * GET /api/material-descriptions: { [materialId]: description } for both
 * catalogs. The pages get the catalogs without descriptions (they're most of
 * the bytes); the directory loads this the first time a search or the detail
 * modal needs it. Built as static JSON at build time.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    Object.fromEntries(getDirectoryMaterials().map((m) => [m.id, m.description])),
  );
}
