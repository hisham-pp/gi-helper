import { notFound } from "next/navigation";

import { CharacterGoalBuilder } from "@/components/characters/character-goal-builder";
import { getCurrentUser } from "@/lib/auth";
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

  return (
    <CharacterGoalBuilder
      character={character as any}
      isAuthenticated={Boolean(user)}
    />
  );
}
