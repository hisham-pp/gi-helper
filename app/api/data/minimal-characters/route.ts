import { NextResponse } from "next/server";

import { getMinimalCharacters } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      characters: getMinimalCharacters(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
