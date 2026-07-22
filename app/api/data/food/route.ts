import { NextResponse } from "next/server";
import foodData from "@/data/consumables/food/en.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(foodData, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
