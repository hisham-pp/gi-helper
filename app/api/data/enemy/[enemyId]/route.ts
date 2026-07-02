import { NextResponse } from "next/server";
import { getEnemyById } from "@/lib/enemy-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ enemyId: string }> },
) {
  const { enemyId } = await params;
  const enemy = getEnemyById(enemyId);

  if (!enemy) {
    return NextResponse.json({ error: "Enemy not found." }, { status: 404 });
  }

  return NextResponse.json(enemy);
}
