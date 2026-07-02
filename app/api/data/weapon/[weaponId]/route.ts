import { NextResponse } from "next/server";
import { getWeaponById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weaponId: string }> },
) {
  const { weaponId } = await params;
  const weapon = getWeaponById(weaponId);

  if (!weapon) {
    return NextResponse.json({ error: "Weapon not found." }, { status: 404 });
  }

  return NextResponse.json(weapon);
}
