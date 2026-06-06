import { CharacterDetailClientPage } from "@/components/characters/character-detail-client-page";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;

  return <CharacterDetailClientPage characterId={characterId} />;
}
