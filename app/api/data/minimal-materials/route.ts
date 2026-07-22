import { NextResponse } from "next/server";

import { getMinimalMaterials } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      materials: getMinimalMaterials(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
