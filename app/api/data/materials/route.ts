import { NextResponse } from "next/server";
import materialsData from "@/data/materials/cooking-ingredients/en.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(materialsData, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
