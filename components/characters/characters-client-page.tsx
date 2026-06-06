"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { CharacterList } from "@/components/dashboard/character-list";
import { Button } from "@/components/ui/button";
import { CharactersPageLoading } from "@/components/ui/page-loading";

type CharacterWithTemplates = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
  isOwned?: boolean;
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
  }>;
};

type ApiUser = {
  username: string;
  role?: string;
} | null;

type CharactersPayload = {
  characters: CharacterWithTemplates[];
  user: ApiUser;
};

export function CharactersClientPage() {
  const [characters, setCharacters] = useState<CharacterWithTemplates[]>([]);
  const [user, setUser] = useState<ApiUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/characters", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load characters.");
      }

      const payload = (await response.json()) as CharactersPayload;

      setCharacters(payload.characters);
      setUser(payload.user);
      setLoadError(null);
    } catch (error) {
      console.error("Character list load failed", error);
      setLoadError("Unable to load characters right now.");
      toast.error("Unable to load characters.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCharacters();
  }, [loadCharacters]);

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
        {user?.role === "master" ? (
          <Link href="/characters/add">
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              Add Character
            </Button>
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <CharactersPageLoading />
      ) : loadError ? (
        <div className="rounded-lg border border-outline-variant bg-surface p-8">
          <h2 className="text-on-surface text-xl font-bold">{loadError}</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Refresh the page or try again in a moment.
          </p>
        </div>
      ) : (
        <CharacterList
          characters={characters}
          isAuthenticated={Boolean(user)}
        />
      )}
    </div>
  );
}
