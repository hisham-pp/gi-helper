import { NextResponse } from "next/server";
import materialsData from "@/data/materials/cooking-ingredients/en.json";

export async function GET() {
  return NextResponse.json(materialsData);
}
