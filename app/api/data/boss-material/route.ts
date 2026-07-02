import { NextResponse } from "next/server";
import bossMaterialData from "@/data/materials/boss-material/en.json";

export async function GET() {
  return NextResponse.json(bossMaterialData);
}
