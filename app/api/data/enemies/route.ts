import { NextResponse } from "next/server";

import { getAllEnemies } from "@/lib/enemy-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const enemies = getAllEnemies();
  return NextResponse.json(
    { enemies },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
