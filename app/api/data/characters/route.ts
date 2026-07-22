import { NextResponse } from "next/server";
import { getAllCharacters } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const characters = getAllCharacters();
  return NextResponse.json(
    { characters },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
