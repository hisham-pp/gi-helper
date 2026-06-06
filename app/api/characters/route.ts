import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllCharacters } from "@/lib/static-data";

export async function GET() {
  const user = await getCurrentUser();
  const characters = getAllCharacters();
  const ownedCharacterIds = user
    ? await prisma.ownedCharacter.findMany({
        where: {
          userId: user.id,
        },
        select: {
          characterId: true,
        },
      })
    : [];
  const ownedCharacterIdSet = new Set(
    ownedCharacterIds.map((item) => item.characterId),
  );

  return NextResponse.json({
    characters: characters.map((character) => ({
      ...character,
      isOwned: ownedCharacterIdSet.has(character.id),
    })),
    user: user
      ? {
          username: user.username,
          role: user.role,
        }
      : null,
  });
}
