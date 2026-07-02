import { NextResponse } from "next/server";
import { getAllMaterials } from "@/lib/static-data";

export async function GET() {
  const materials = getAllMaterials();
  return NextResponse.json({ materials });
}
