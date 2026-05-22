"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useEffect, useState, useTransition } from "react";
import { Search, ChevronRight, CircleCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { setOwnedCharacterAction } from "@/app/actions";
import { Card } from "@/components/ui/card";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

type CharacterListProps = {
  characters: CharacterWithTemplates[];
  isAuthenticated?: boolean;
};

export function CharacterList({
  characters,
  isAuthenticated = true,
}: CharacterListProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [elementFilter, setElementFilter] = useState("All");
  const [weaponFilter, setWeaponFilter] = useState("All");
  const [ownershipFilter, setOwnershipFilter] = useState("All");
  const [ownedCharacterIds, setOwnedCharacterIds] = useState(
    () =>
      new Set(
        characters
          .filter((character) => character.isOwned)
          .map((character) => character.id),
      ),
  );

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  useEffect(() => {
    setOwnedCharacterIds(
      new Set(
        characters
          .filter((character) => character.isOwned)
          .map((character) => character.id),
      ),
    );
  }, [characters]);

  const elements = useMemo(
    () => ["All", ...new Set(characters.map((c) => c.element))],
    [characters],
  );

  const weaponTypes = useMemo(
    () => ["All", ...new Set(characters.map((c) => c.weaponType))],
    [characters],
  );

  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesElement =
        elementFilter === "All" || c.element === elementFilter;
      const matchesWeapon =
        weaponFilter === "All" || c.weaponType === weaponFilter;
      const isOwned = ownedCharacterIds.has(c.id);
      const matchesOwnership =
        ownershipFilter === "All" ||
        (ownershipFilter === "Owned" && isOwned) ||
        (ownershipFilter === "Not owned" && !isOwned);

      return (
        matchesSearch && matchesElement && matchesWeapon && matchesOwnership
      );
    });
  }, [
    characters,
    search,
    elementFilter,
    weaponFilter,
    ownershipFilter,
    ownedCharacterIds,
  ]);

  function toggleOwned(character: CharacterWithTemplates) {
    if (!isAuthenticated) {
      toast.error("Log in to mark owned characters.");
      return;
    }

    const nextOwned = !ownedCharacterIds.has(character.id);

    setOwnedCharacterIds((current) => {
      const next = new Set(current);
      if (nextOwned) {
        next.add(character.id);
      } else {
        next.delete(character.id);
      }
      return next;
    });

    startTransition(async () => {
      const result = await setOwnedCharacterAction({
        characterId: character.id,
        owned: nextOwned,
      });

      if (!result.success) {
        setOwnedCharacterIds((current) => {
          const next = new Set(current);
          if (nextOwned) {
            next.delete(character.id);
          } else {
            next.add(character.id);
          }
          return next;
        });
        toast.error(result.error ?? "Unable to save ownership.");
        return;
      }

      toast.success(
        nextOwned
          ? `${character.name} marked as owned.`
          : `${character.name} removed from owned.`,
      );
    });
  }

  return (
    <div className="space-y-6">
      <header className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start gap-3 sm:min-w-0">
          <AppTextField
            label="Search Characters"
            variant="outlined"
            className="min-w-64 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Element"
            variant="outlined"
            className="w-32 flex-none"
            value={elementFilter}
            onChange={setElementFilter}
            options={elements.map((e) => ({ label: e, value: e }))}
          />
          <Select
            label="Weapon"
            variant="outlined"
            className="w-32 flex-none"
            value={weaponFilter}
            onChange={setWeaponFilter}
            options={weaponTypes.map((w) => ({ label: w, value: w }))}
          />
          <Select
            label="Owned"
            variant="outlined"
            className="w-36 flex-none"
            value={ownershipFilter}
            onChange={setOwnershipFilter}
            options={["All", "Owned", "Not owned"].map((value) => ({
              label: value,
              value,
            }))}
          />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredCharacters.map((character) => {
          const isOwned = ownedCharacterIds.has(character.id);

          return (
            <Card
              key={character.id}
              variant="outlined"
              className="group flex h-full items-center gap-2 p-3 transition-all hover:border-primary hover:shadow-md"
            >
              <Link
                href={`/characters/${character.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div
                  className={cn(
                    "relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br",
                    rarityColorMap[character.rarity] ?? rarityColorMap[1],
                  )}
                >
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <h3 className="text-on-surface truncate text-sm font-bold">
                      {character.name}
                    </h3>
                    {isOwned ? (
                      <CircleCheck className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    ) : null}
                  </div>
                  <p className="text-on-surface-variant truncate text-[10px]">
                    {character.element} · {character.weaponType}
                  </p>
                  <p className="text-on-surface-variant mt-0.5 text-[10px]">
                    {character.templates.length} template
                    {character.templates.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggleOwned(character)}
                aria-pressed={isOwned}
                aria-label={
                  isOwned
                    ? `Mark ${character.name} as not owned`
                    : `Mark ${character.name} as owned`
                }
                title={isOwned ? "Owned" : "Mark as owned"}
                className={cn(
                  "inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
                  isOwned
                    ? "border-primary bg-primary-container text-primary"
                    : "text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary",
                )}
              >
                <CircleCheck className="h-4 w-4" />
              </button>
            </Card>
          );
        })}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-on-surface font-bold">No characters found</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
