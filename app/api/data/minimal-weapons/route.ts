import { NextResponse } from "next/server";

import { getMinimalWeapons } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      weapons: getMinimalWeapons(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
