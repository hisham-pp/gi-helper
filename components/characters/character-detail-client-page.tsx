"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  CharacterGoalBuilder,
  type CharacterDetail,
} from "@/components/characters/character-goal-builder";
import { Button } from "@/components/ui/button";
import { CharacterDetailPageLoading } from "@/components/ui/page-loading";

type CharacterDetailPayload = {
  character: CharacterDetail;
  isOwned: boolean;
  user: {
    username: string;
    role?: string;
  } | null;
};

export function CharacterDetailClientPage({
  characterId,
}: {
  characterId: string;
}) {
  const [payload, setPayload] = useState<CharacterDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCharacter = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        cache: "no-store",
      });

      if (response.status === 404) {
        setNotFound(true);
        setPayload(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load character.");
      }

      const nextPayload = (await response.json()) as CharacterDetailPayload;

      setPayload(nextPayload);
      setNotFound(false);
      setLoadError(null);
    } catch (error) {
      console.error("Character detail load failed", error);
      setLoadError("Unable to load this character right now.");
      toast.error("Unable to load character.");
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    void loadCharacter();
  }, [loadCharacter]);

  if (isLoading) {
    return <CharacterDetailPageLoading />;
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          Character not found
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          That character is not available in the local data set.
        </p>
        <Link className="mt-6 block w-fit" href="/characters">
          <Button variant="outlined">Back to characters</Button>
        </Link>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">
          {loadError ?? "Unable to load this character."}
        </h1>
        <p className="text-on-surface-variant mt-3 text-sm">
          Refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <CharacterGoalBuilder
      character={payload.character}
      isAuthenticated={Boolean(payload.user)}
      isOwned={payload.isOwned}
    />
  );
}
