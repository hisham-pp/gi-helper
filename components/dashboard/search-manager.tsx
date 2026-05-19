"use client";

import { useState, useMemo } from "react";
import { Search, Users, Gem, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import AppTextField from "@/components/core/app-textfield";
import { Card } from "@/components/ui/card";
import { CharacterList } from "@/components/dashboard/character-list";
import { rarityColorMap, rarityBorderMap } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

type Material = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  category: string;
  quantity: number;
};

type SearchManagerProps = {
  characters: any[];
  materials: Material[];
};

export function SearchManager({ characters, materials }: SearchManagerProps) {
  const [search, setSearch] = useState("");

  const filteredCharacters = useMemo(() => {
    if (!search) return [];
    return characters.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [characters, search]);

  const filteredMaterials = useMemo(() => {
    if (!search) return [];
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [materials, search]);

  const hasResults =
    filteredCharacters.length > 0 || filteredMaterials.length > 0;

  return (
    <div className="space-y-8">
      <div className="max-w-xl">
        <AppTextField
          label="Search anything..."
          variant="outlined"
          className="h-14 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!search && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <Users className="h-5 w-5 text-primary" />
              Recent Characters
            </h2>
            <div className="mt-4 space-y-2">
              {characters.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/characters?search=${c.name}`}
                  className="hover:bg-surface-variant/50 flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <span className="text-sm">{c.name}</span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
          <Card variant="outlined" className="p-6">
            <h2 className="text-on-surface flex items-center gap-2 font-bold">
              <Gem className="h-5 w-5 text-primary" />
              Common Materials
            </h2>
            <div className="mt-4 space-y-2">
              {materials.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/materials?search=${m.name}`}
                  className="hover:bg-surface-variant/50 flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <span className="text-sm">{m.name}</span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      {search && !hasResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-on-surface font-bold">No results found</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
            We couldn&apos;t find anything matching &quot;{search}&quot;.
          </p>
        </div>
      )}

      {search && hasResults && (
        <div className="space-y-12">
          {filteredCharacters.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <Users className="h-6 w-6 text-primary" />
                Characters ({filteredCharacters.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCharacters.map((character) => (
                  <Card key={character.id} variant="outlined" className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[character.rarity] ??
                            rarityColorMap[1],
                        )}
                      >
                        <Image
                          src={character.image}
                          alt={character.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 className="text-on-surface font-bold">
                          {character.name}
                        </h3>
                        <p className="text-on-surface-variant text-xs">
                          {character.element} • {character.weaponType}
                        </p>
                        <Link
                          href={`/characters?search=${character.name}`}
                          className="text-primary mt-1 inline-block text-xs font-bold hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredMaterials.length > 0 && (
            <section>
              <h2 className="text-on-surface mb-6 flex items-center gap-2 text-xl font-bold">
                <Gem className="h-6 w-6 text-primary" />
                Materials ({filteredMaterials.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    variant="outlined"
                    className={cn(
                      "p-4 transition-all hover:shadow-md",
                      rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
                          rarityColorMap[material.rarity] ??
                            rarityColorMap[1],
                        )}
                      >
                        <Image
                          src={`/api/material-image/${material.id}`}
                          alt={material.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-on-surface truncate text-sm font-bold">
                          {material.name}
                        </h3>
                        <p className="text-on-surface-variant truncate text-[10px]">
                          {material.category}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
