import { notFound } from "next/navigation";

import { CharacterGoalBuilder } from "@/components/characters/character-goal-builder";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCharacterById } from "@/lib/static-data";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const user = await getCurrentUser();
  const { characterId } = await params;

  const character = getCharacterById(characterId);

  if (!character) {
    notFound();
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

  return (
    <CharacterGoalBuilder
      character={character as any}
      isAuthenticated={Boolean(user)}
      isOwned={Boolean(ownedCharacter)}
    />
  );
}
