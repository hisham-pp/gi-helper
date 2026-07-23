import { NextResponse } from "next/server";
import { getCharacterById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterId: string }> },
) {
  const { characterId } = await params;
  const character = getCharacterById(characterId);

  if (!character) {
    return NextResponse.json(
      { error: "Character not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(character);
}
