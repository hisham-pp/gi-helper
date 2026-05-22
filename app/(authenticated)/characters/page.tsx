import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllCharacters } from "@/lib/static-data";
import { CharacterList } from "@/components/dashboard/character-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Suspense } from "react";

export default async function CharactersPage() {
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
  const charactersWithOwnership = characters.map((character) => ({
    ...character,
    isOwned: ownedCharacterIdSet.has(character.id),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            Characters
          </h1>
          <p className="text-on-surface-variant mt-1">
            Browse characters and open a card to create one or more farming
            goals.
          </p>
        </div>
        {user?.role === "master" && (
          <Link href="/characters/add">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Add Character
            </Button>
          </Link>
        )}
      </div>

      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl bg-surface-variant/20" />
        }
      >
        <CharacterList
          characters={charactersWithOwnership}
          isAuthenticated={Boolean(user)}
        />
      </Suspense>
    </div>
  );
}
