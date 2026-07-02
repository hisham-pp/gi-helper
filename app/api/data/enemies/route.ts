import { NextResponse } from "next/server";

import { getAllEnemies } from "@/lib/enemy-data";

export async function GET() {
  const enemies = getAllEnemies();
  return NextResponse.json({ enemies });
}
