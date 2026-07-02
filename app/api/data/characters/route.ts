import { NextResponse } from "next/server";
import { getAllCharacters } from "@/lib/static-data";

export async function GET() {
  const characters = getAllCharacters();
  return NextResponse.json({ characters });
}
