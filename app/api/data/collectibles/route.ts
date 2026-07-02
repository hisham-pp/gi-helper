import { NextResponse } from "next/server";
import collectibleMarkers from "@/data/interactive-map/collectibles.json";

export async function GET() {
  return NextResponse.json(collectibleMarkers);
}
