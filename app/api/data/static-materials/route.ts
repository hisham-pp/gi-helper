import { NextResponse } from "next/server";
import { getAllMaterials } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const materials = getAllMaterials();
  return NextResponse.json(
    { materials },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
