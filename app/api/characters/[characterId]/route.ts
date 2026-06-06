import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCharacterById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterId: string }> },
) {
  const user = await getCurrentUser();
  const { characterId } = await params;
  const character = getCharacterById(characterId);

  if (!character) {
    return NextResponse.json({ error: "Character not found." }, { status: 404 });
  }

  const ownedCharacter = user
    ? await prisma.ownedCharacter.findUnique({
        where: {
          userId_characterId: {
            userId: user.id,
            characterId,
          },
        },
        select: {
          id: true,
        },
      })
    : null;

  return NextResponse.json({
    character,
    isOwned: Boolean(ownedCharacter),
    user: user
      ? {
          username: user.username,
          role: user.role,
        }
      : null,
  });
}
