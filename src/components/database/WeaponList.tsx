"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Sparkles, Star, Swords } from "lucide-react";
import {
  paginate,
  RarityStars,
  TabEmptyState,
} from "@/components/inventory/shared";
import { GameIcon } from "@/components/ui/GameIcon";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { PillTabs } from "@/components/ui/PillTabs";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import {
  getAllWeapons,
  WEAPON_TYPE_NAMES,
  WEAPON_TYPES,
  weaponIconUrl,
  type WeaponInfo,
} from "@/lib/good/catalog";
import { useOwnedWeapons } from "@/lib/good-inventory";
import { getRarityStyles } from "@/lib/material-ui";

type SortOption = "rarity" | "atk" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rarity", label: "Rarity (5★ first)" },
  { value: "atk", label: "Base ATK (high → low)" },
  { value: "name", label: "Name (A → Z)" },
];

const PAGE_SIZE = 48;

/** The /weapons page: every weapon with its max-level stats and passive, owned ones marked. */
export function WeaponList() {
  const weapons = useMemo(() => getAllWeapons(), []);
  const [owned] = useOwnedWeapons();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [rarity, setRarity] = useState("ALL");
  const [substat, setSubstat] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, type, rarity, substat, sortBy]);

  const ownedCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of owned) map.set(w.key, (map.get(w.key) ?? 0) + 1);
    return map;
  }, [owned]);

  const substats = useMemo(
    () =>
      [
        ...new Set(weapons.flatMap((w) => (w.substat ? [w.substat.name] : []))),
      ].sort(),
    [weapons],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = weapons.filter(
      (w) =>
        (!q ||
          w.name.toLowerCase().includes(q) ||
          w.passive?.toLowerCase().includes(q)) &&
        (type === "ALL" || w.type === type) &&
        (rarity === "ALL" || w.rarity === Number(rarity)) &&
        (substat === "ALL" || w.substat?.name === substat),
    );
    const byName = (a: WeaponInfo, b: WeaponInfo) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    return list.sort((a, b) => {
      switch (sortBy) {
        case "atk":
          return b.atk - a.atk || byName(a, b);
        case "name":
          return byName(a, b);
        default:
          return b.rarity - a.rarity || byName(a, b);
      }
    });
  }, [weapons, search, type, rarity, substat, sortBy]);

  const {
    pageItems,
    page: currentPage,
    totalPages,
  } = paginate(filtered, page, PAGE_SIZE);
  const isFiltered =
    search.trim() !== "" ||
    type !== "ALL" ||
    rarity !== "ALL" ||
    substat !== "ALL" ||
    sortBy !== "rarity";
  const reset = () => {
    setSearch("");
    setType("ALL");
    setRarity("ALL");
    setSubstat("ALL");
    setSortBy("rarity");
  };

  return (
    // db/layout.tsx holds the page padding and DatabaseNav
    <div className="w-full space-y-6">
      <div className="glass-card glass-card--lg p-6 sm:p-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
              <Swords className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              Weapons
            </h1>
          </div>
          <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
            All {weapons.length} weapons with their base ATK and substat at max
            level and their passive. The ones in your inventory are marked.
          </p>
        </div>
      </div>

      <div className="glass-card glass-card--lg space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search weapons by name or passive..."
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <PillDropdown
              label="Sort:"
              icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={SORT_OPTIONS}
            />
            <PillDropdown
              label="Substat:"
              icon={<Sparkles className="h-3.5 w-3.5 text-cyan-300" />}
              value={substat}
              onChange={setSubstat}
              options={[
                { value: "ALL", label: "All" },
                ...substats.map((s) => ({ value: s, label: s })),
              ]}
            />
            <PillDropdown
              label="Rarity:"
              icon={<Star className="h-3.5 w-3.5 text-amber-300" />}
              value={rarity}
              onChange={setRarity}
              options={[
                { value: "ALL", label: "All" },
                ...[5, 4, 3, 2, 1].map((r) => ({
                  value: String(r),
                  label: `${r}★`,
                })),
              ]}
            />
            <ResetFiltersButton visible={isFiltered} onReset={reset} />
          </div>
        </div>

        {/* Scrolls sideways on phones */}
        <div className="no-scrollbar -mx-4 -my-3 flex items-center gap-2 overflow-x-auto px-4 py-3">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-white/40">
            Type:
          </span>
          <PillTabs
            ariaLabel="Weapon type"
            value={type}
            onChange={setType}
            options={[
              { value: "ALL", label: "All", count: weapons.length },
              ...WEAPON_TYPES.map((t) => ({
                value: t,
                label: WEAPON_TYPE_NAMES[t],
                count: weapons.filter((w) => w.type === t).length,
              })),
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-white/70">
        <span>
          Showing{" "}
          <strong className="font-mono text-white">{filtered.length}</strong> of{" "}
          <strong className="font-mono text-white">{weapons.length}</strong>{" "}
          weapons
        </span>
        {totalPages > 1 && (
          <span className="text-white/60">
            Page <strong className="text-white">{currentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
        )}
      </div>

      {pageItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pageItems.map((w) => (
            <WeaponCard
              key={w.id}
              weapon={w}
              owned={ownedCount.get(w.key) ?? 0}
            />
          ))}
        </div>
      ) : (
        <TabEmptyState
          icon={Swords}
          title="No weapons match"
          text="Try another search or reset the filters."
        >
          <button
            onClick={reset}
            className="glass-btn glass-btn--primary px-5 py-2 text-xs"
          >
            Reset All Filters
          </button>
        </TabEmptyState>
      )}

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}

const WeaponCard = React.memo(function WeaponCard({
  weapon,
  owned,
}: {
  weapon: WeaponInfo;
  owned: number;
}) {
  return (
    <div
      style={
        {
          "--glass-accent": getRarityStyles(weapon.rarity).accent,
        } as React.CSSProperties
      }
      className="glass-card glass-card--hover flex flex-col items-center p-4 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      {owned > 0 && (
        <span
          className="glass-chip absolute left-2 top-2 z-10 px-1.5 py-0 text-[10px] font-bold text-emerald-300"
          title="In your inventory"
        >
          Owned{owned > 1 ? ` ×${owned}` : ""}
        </span>
      )}
      <div className="glass-well glass-well--tinted relative mb-2 mt-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        <GameIcon
          src={weaponIconUrl(weapon.id)}
          alt={weapon.name}
          size={64}
          className="h-14 w-14"
          fallback={<Swords className="h-7 w-7 text-white/40" />}
        />
      </div>
      <RarityStars rarity={weapon.rarity} className="mb-1" />
      <h2 className="line-clamp-2 min-h-[2rem] text-xs font-bold leading-tight text-white">
        {weapon.name}
      </h2>
      <p className="mt-1 text-[11px] text-white/60">
        {WEAPON_TYPE_NAMES[weapon.type]}
      </p>
      <p className="mt-1 font-mono text-[11px] text-white/80">
        ATK {weapon.atk}
      </p>
      {weapon.substat && (
        <p className="font-mono text-[11px] text-white/80">
          {weapon.substat.name} {weapon.substat.value}
        </p>
      )}
      {weapon.passive && (
        <p
          className="mt-1 line-clamp-1 text-[10px] italic text-white/50"
          title={weapon.passive}
        >
          {weapon.passive}
        </p>
      )}
    </div>
  );
});
