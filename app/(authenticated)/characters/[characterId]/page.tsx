import { notFound } from "next/navigation";

import { CharacterGoalBuilder } from "@/components/characters/character-goal-builder";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  await requireUser();
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

  return <CharacterGoalBuilder character={character as any} />;
}
