import { NextResponse } from "next/server";
import materials from "@/data/materials.json";

export async function GET() {
  return NextResponse.json(materials, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
