import { notFound } from "next/navigation";

import { CharacterGoalBuilder } from "@/components/characters/character-goal-builder";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const user = await getCurrentUser();
  const { characterId } = await params;

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      templates: {
        include: {
          materials: {
            include: {
              material: true,
            },
            orderBy: {
              material: {
                name: "asc",
              },
            },
          },
        },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!character) {
    notFound();
  }

  return (
    <CharacterGoalBuilder
      character={character as any}
      isAuthenticated={Boolean(user)}
    />
  );
}
