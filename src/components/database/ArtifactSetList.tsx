"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpDown, Flower2, Star } from "lucide-react";
import { RarityStars, TabEmptyState } from "@/components/inventory/shared";
import { GameIcon } from "@/components/ui/GameIcon";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import { artifactIconUrl, getAllArtifactSets, type ArtifactSetInfo } from "@/lib/good/catalog";
import { SLOT_KEYS, SLOT_NAMES } from "@/lib/good/types";
import { useOwnedArtifacts } from "@/lib/good-inventory";
import { getRarityStyles } from "@/lib/material-ui";
import { DatabaseNav } from "./DatabaseNav";

type SortOption = "rarity" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rarity", label: "Rarity (5★ first)" },
  { value: "name", label: "Name (A → Z)" },
];

const BONUS_LABELS = { "1": "1-Piece", "2": "2-Piece", "4": "4-Piece" } as const;

const maxRarity = (s: ArtifactSetInfo) => Math.max(...s.rarities);

/** The /artifacts page: every artifact set with its pieces and bonuses, owned pieces counted. */
export function ArtifactSetList() {
  const sets = useMemo(() => getAllArtifactSets(), []);
  const [owned] = useOwnedArtifacts();
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");

  const ownedPieces = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of owned) map.set(a.setKey, (map.get(a.setKey) ?? 0) + 1);
    return map;
  }, [owned]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = sets.filter((s) => {
      if (rarity !== "ALL" && maxRarity(s) !== Number(rarity)) return false;
      if (!q) return true;
      const text = [s.name, ...Object.values(s.pieces), ...Object.values(s.bonuses)].join(" ").toLowerCase();
      return text.includes(q);
    });
    const byName = (a: ArtifactSetInfo, b: ArtifactSetInfo) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    return sortBy === "name" ? list.sort(byName) : list.sort((a, b) => maxRarity(b) - maxRarity(a) || byName(a, b));
  }, [sets, search, rarity, sortBy]);

  const isFiltered = search.trim() !== "" || rarity !== "ALL" || sortBy !== "rarity";
  const reset = () => {
    setSearch("");
    setRarity("ALL");
    setSortBy("rarity");
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <div className="w-full max-w-7xl space-y-6">
        <DatabaseNav />

        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                <Flower2 className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                Artifact Sets
              </h1>
            </div>
            <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
              All {sets.length} artifact sets with their pieces and set bonuses. Sets you have pieces
              of in your inventory show how many.
            </p>
          </div>
        </div>

        <div className="glass-card glass-card--lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SearchField value={search} onChange={setSearch} placeholder="Search sets, pieces or bonuses..." />
            <div className="flex flex-wrap items-center gap-2.5">
              <PillDropdown
                label="Sort:"
                icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={SORT_OPTIONS}
              />
              <PillDropdown
                label="Max rarity:"
                icon={<Star className="h-3.5 w-3.5 text-amber-300" />}
                value={rarity}
                onChange={setRarity}
                options={[
                  { value: "ALL", label: "All" },
                  ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r}★` })),
                ]}
              />
              <ResetFiltersButton visible={isFiltered} onReset={reset} />
            </div>
          </div>
        </div>

        <div className="px-1 text-xs text-white/70">
          Showing <strong className="font-mono text-white">{filtered.length}</strong> of{" "}
          <strong className="font-mono text-white">{sets.length}</strong> sets
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <ArtifactSetCard key={s.id} set={s} owned={ownedPieces.get(s.key) ?? 0} />
            ))}
          </div>
        ) : (
          <TabEmptyState icon={Flower2} title="No sets match" text="Try another search or reset the filters.">
            <button onClick={reset} className="glass-btn glass-btn--primary px-5 py-2 text-xs">
              Reset All Filters
            </button>
          </TabEmptyState>
        )}
      </div>
    </div>
  );
}

const ArtifactSetCard = React.memo(function ArtifactSetCard({ set, owned }: { set: ArtifactSetInfo; owned: number }) {
  const top = maxRarity(set);
  const low = Math.min(...set.rarities);
  return (
    <div
      style={{ "--glass-accent": getRarityStyles(top).accent } as React.CSSProperties}
      className="glass-card glass-card--hover flex flex-col gap-3 p-5 hover:transform-none motion-safe:hover:animate-squish"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white">{set.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/60">
            <RarityStars rarity={top} />
            {low !== top && <span>from {low}★</span>}
          </p>
        </div>
        {owned > 0 && (
          <span className="glass-chip shrink-0 px-2 py-0.5 text-[10px] font-bold text-emerald-300" title="In your inventory">
            {owned} owned
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SLOT_KEYS.filter((slot) => set.pieces[slot]).map((slot) => (
          <div
            key={slot}
            className="glass-well glass-well--tinted flex h-12 w-12 items-center justify-center rounded-xl"
            title={`${set.pieces[slot]} (${SLOT_NAMES[slot]})`}
          >
            <GameIcon
              src={artifactIconUrl(set.id, slot)}
              alt={set.pieces[slot] ?? SLOT_NAMES[slot]}
              size={48}
              className="h-10 w-10"
              fallback={<Flower2 className="h-5 w-5 text-white/40" />}
            />
          </div>
        ))}
      </div>

      <dl className="space-y-1.5 text-[11px] leading-relaxed">
        {(["1", "2", "4"] as const).map((n) =>
          set.bonuses[n] ? (
            <div key={n}>
              <dt className="inline font-bold text-cyan-300">{BONUS_LABELS[n]}: </dt>
              <dd className="inline text-white/75">{set.bonuses[n]}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </div>
  );
});
