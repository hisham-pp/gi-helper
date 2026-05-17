"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
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
};

export function CharacterList({ characters }: CharacterListProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [elementFilter, setElementFilter] = useState("All");
  const [weaponFilter, setWeaponFilter] = useState("All");

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

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

      return matchesSearch && matchesElement && matchesWeapon;
    });
  }, [characters, search, elementFilter, weaponFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm flex-1">
          <TextField
            label="Search Characters"
            variant="outlined"
            className="h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            label="Element"
            variant="outlined"
            className="h-12 w-32"
            value={elementFilter}
            onChange={setElementFilter}
            options={elements.map((e) => ({ label: e, value: e }))}
          />
          <Select
            label="Weapon"
            variant="outlined"
            className="h-12 w-32"
            value={weaponFilter}
            onChange={setWeaponFilter}
            options={weaponTypes.map((w) => ({ label: w, value: w }))}
          />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredCharacters.map((character) => (
          <Link key={character.id} href={`/characters/${character.id}`}>
            <Card
              variant="outlined"
              className="group flex h-full items-center gap-3 p-3 transition-all hover:border-primary hover:shadow-md"
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
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-on-surface truncate text-sm font-bold">
                  {character.name}
                </h3>
                <p className="text-on-surface-variant truncate text-[10px]">
                  {character.element} · {character.weaponType}
                </p>
                <p className="text-on-surface-variant mt-0.5 text-[10px]">
                  {character.templates.length} template
                  {character.templates.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
            </Card>
          </Link>
        ))}
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
