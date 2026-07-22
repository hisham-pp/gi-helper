import { NextResponse } from "next/server";
import { getAllWeapons } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const weapons = getAllWeapons();
  return NextResponse.json(
    { weapons },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
