import { NextResponse } from "next/server";
import { getAllWeapons } from "@/lib/static-data";

export async function GET() {
  const weapons = getAllWeapons();
  return NextResponse.json({ weapons });
}
