"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CachedImage } from "@/components/ui/cached-image";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/core/app-select";
import { rarityColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

type WeaponWithTemplates = {
  id: string;
  name: string;
  image: string;
  rarity: number;
  weaponType: string;
  templates: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    sortOrder: number;
  }>;
};

type WeaponListProps = {
  weapons: WeaponWithTemplates[];
};

export function WeaponList({ weapons }: WeaponListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState("All");

  const weaponTypes = useMemo(
    () => ["All", ...new Set(weapons.map((w) => w.weaponType))],
    [weapons],
  );

  const rarities = useMemo(
    () => [
      "All",
      ...[...new Set(weapons.map((w) => w.rarity))]
        .sort((a, b) => b - a)
        .map((r) => String(r)),
    ],
    [weapons],
  );

  const filteredWeapons = useMemo(() => {
    return weapons.filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || w.weaponType === typeFilter;
      const matchesRarity =
        rarityFilter === "All" || String(w.rarity) === rarityFilter;

      return matchesSearch && matchesType && matchesRarity;
    });
  }, [weapons, search, typeFilter, rarityFilter]);

  return (
    <div className="space-y-6">
      <header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_8rem_8rem]">
          <AppTextField
            label="Search Weapons"
            variant="outlined"
            className="sm:col-span-2 lg:col-span-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Type"
            variant="outlined"
            value={typeFilter}
            onChange={setTypeFilter}
            options={weaponTypes.map((t) => ({ label: t, value: t }))}
          />
          <Select
            label="Rarity"
            variant="outlined"
            value={rarityFilter}
            onChange={setRarityFilter}
            options={rarities.map((r) => ({
              label: r === "All" ? "All" : `${r}★`,
              value: r,
            }))}
          />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredWeapons.map((weapon) => (
          <Card
            key={weapon.id}
            variant="outlined"
            className="group flex h-full items-center gap-2 p-3 transition-all hover:border-primary hover:shadow-md"
          >
            <Link
              href={`/weapons/${weapon.id}` as Route}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div
                className={cn(
                  "relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br",
                  rarityColorMap[weapon.rarity] ?? rarityColorMap[1],
                )}
              >
                <CachedImage
                  src={weapon.image}
                  alt={weapon.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-on-surface truncate text-sm font-bold">
                  {weapon.name}
                </h3>
                <p className="text-on-surface-variant truncate text-[10px]">
                  {weapon.rarity}★ · {weapon.weaponType}
                </p>
                <p className="text-on-surface-variant mt-0.5 text-[10px]">
                  {weapon.templates.length} template
                  {weapon.templates.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight className="text-on-surface-variant h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
            </Link>
          </Card>
        ))}
      </div>

      {filteredWeapons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-on-surface font-bold">No weapons found</h3>
          <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
