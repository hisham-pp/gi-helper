"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, FileUp, Star, Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GameIcon } from "@/components/ui/GameIcon";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import { useConfirm } from "@/components/ui/use-confirm";
import {
  getWeapon,
  nameFromKey,
  WEAPON_TYPE_NAMES,
  WEAPON_TYPES,
  weaponIconUrl,
  type WeaponInfo,
} from "@/lib/good/catalog";
import { formatLevel, type OwnedWeapon } from "@/lib/good/types";
import { useOwnedWeapons } from "@/lib/good-inventory";
import { getRarityStyles } from "@/lib/material-ui";
import { EquippedBy, LockBadge, paginate, RarityStars, ResultsCounter, TabEmptyState, useHydrated } from "./shared";
import { useInventoryActions } from "./InventoryShell";

type SortOption = "rarity" | "level" | "refinement" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rarity", label: "Rarity (5★ first)" },
  { value: "level", label: "Level (high → low)" },
  { value: "refinement", label: "Refinement (high → low)" },
  { value: "name", label: "Name (A → Z)" },
];

const PAGE_SIZE = 48;

interface Entry {
  weapon: OwnedWeapon;
  info?: WeaponInfo;
  name: string;
  rarity: number;
}

/** The Weapons tab of /inventory: owned weapons with level, refinement and who holds them. */
export function WeaponsInventory() {
  const { openImport: onImport } = useInventoryActions();
  const hydrated = useHydrated();
  const [weapons, setWeapons] = useOwnedWeapons();
  const { confirm, confirmModal } = useConfirm();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [rarity, setRarity] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, type, rarity, sortBy]);

  const entries = useMemo<Entry[]>(
    () =>
      weapons.map((weapon) => {
        const info = getWeapon(weapon.key);
        return { weapon, info, name: info?.name ?? nameFromKey(weapon.key), rarity: info?.rarity ?? 1 };
      }),
    [weapons],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = entries.filter(
      (e) =>
        (!q || e.name.toLowerCase().includes(q)) &&
        (type === "ALL" || e.info?.type === type) &&
        (rarity === "ALL" || e.rarity === Number(rarity)),
    );
    const byName = (a: Entry, b: Entry) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    return list.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return b.weapon.level - a.weapon.level || b.rarity - a.rarity || byName(a, b);
        case "refinement":
          return b.weapon.refinement - a.weapon.refinement || b.rarity - a.rarity || byName(a, b);
        case "name":
          return byName(a, b);
        default:
          return b.rarity - a.rarity || b.weapon.level - a.weapon.level || byName(a, b);
      }
    });
  }, [entries, search, type, rarity, sortBy]);

  const { pageItems, page: currentPage, totalPages } = paginate(filtered, page, PAGE_SIZE);
  const isFiltered = search.trim() !== "" || type !== "ALL" || rarity !== "ALL" || sortBy !== "rarity";

  const handleRemove = useCallback(
    (id: string) => setWeapons((prev) => prev.filter((w) => w.id !== id)),
    [setWeapons],
  );

  const handleClear = useCallback(async () => {
    const confirmed = await confirm({
      title: "Remove all weapons?",
      message: "Every weapon is removed from this browser. Export to GOOD first if you want to keep them.",
      confirmLabel: "Remove All",
      tone: "danger",
      icon: Trash2,
    });
    if (!confirmed) return;
    setWeapons([]);
    toast.success("Weapons removed");
  }, [confirm, setWeapons]);

  // Nothing until the browser's copy is read, so the empty state doesn't flash
  if (!hydrated) return null;

  if (weapons.length === 0) {
    return (
      <TabEmptyState
        icon={Swords}
        title="No weapons yet"
        text="Import a GOOD file from Genshin Optimizer or another scanner to bring in your weapons. Scanning the Weapons tab is coming next."
      >
        <button onClick={onImport} className="glass-btn glass-btn--primary px-5 py-2 text-xs">
          <FileUp className="h-4 w-4" /> Import .GOOD
        </button>
      </TabEmptyState>
    );
  }

  const typeCounts = WEAPON_TYPES.map((t) => ({ t, n: entries.filter((e) => e.info?.type === t).length }));

  return (
    <>
      <div className="glass-card glass-card--lg p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search your weapons..." />
          <div className="flex flex-wrap items-center gap-2.5">
            <PillDropdown
              label="Sort:"
              icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={SORT_OPTIONS}
            />
            <PillDropdown
              label="Type:"
              icon={<Swords className="h-3.5 w-3.5 text-cyan-300" />}
              value={type}
              onChange={setType}
              options={[
                { value: "ALL", label: `All (${entries.length})` },
                ...typeCounts.map(({ t, n }) => ({ value: t, label: `${WEAPON_TYPE_NAMES[t]} (${n})` })),
              ]}
            />
            <PillDropdown
              label="Rarity:"
              icon={<Star className="h-3.5 w-3.5 text-amber-300" />}
              value={rarity}
              onChange={setRarity}
              options={[
                { value: "ALL", label: `All (${entries.length})` },
                ...[5, 4, 3, 2, 1].map((r) => ({
                  value: String(r),
                  label: `${r}★ (${entries.filter((e) => e.rarity === r).length})`,
                })),
              ]}
            />
            <ResetFiltersButton
              visible={isFiltered}
              onReset={() => {
                setSearch("");
                setType("ALL");
                setRarity("ALL");
                setSortBy("rarity");
              }}
            />
          </div>
        </div>
      </div>

      <ResultsCounter
        shown={filtered.length}
        total={weapons.length}
        noun="weapons"
        page={currentPage}
        totalPages={totalPages}
      >
        <button onClick={handleClear} className="glass-btn glass-btn--danger px-3 py-1.5 text-xs">
          <Trash2 className="h-3.5 w-3.5" /> Remove all
        </button>
      </ResultsCounter>

      {pageItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pageItems.map((entry) => (
            <WeaponCard key={entry.weapon.id} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={filtered.length}
        onPageChange={setPage}
      />
      {confirmModal}
    </>
  );
}

const WeaponCard = React.memo(function WeaponCard({
  entry: { weapon, info, name, rarity },
  onRemove,
}: {
  entry: Entry;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{ "--glass-accent": getRarityStyles(rarity).accent } as React.CSSProperties}
      className="glass-card glass-card--hover group flex flex-col items-center p-4 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      <button
        onClick={() => onRemove(weapon.id)}
        className="glass-icon-btn absolute right-2 top-2 z-10 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus-visible:opacity-100"
        title="Remove weapon"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <span className="absolute left-2.5 top-2.5">
        <LockBadge locked={weapon.lock} />
      </span>

      <div className="glass-well glass-well--tinted relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        <GameIcon
          src={info ? weaponIconUrl(info.id) : null}
          alt={name}
          size={64}
          className="h-14 w-14"
          fallback={<Swords className="h-7 w-7 text-white/40" />}
        />
        <span className="glass-chip absolute bottom-0.5 right-0.5 z-10 px-1.5 py-0 font-mono text-[10px] font-bold text-white">
          R{weapon.refinement}
        </span>
      </div>

      <RarityStars rarity={rarity} className="mb-1" />
      <h3 className="line-clamp-2 min-h-[2rem] text-xs font-bold leading-tight text-white" title={name}>
        {name}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-white/70">Lv. {formatLevel(weapon.level, weapon.ascension)}</p>
      <div className="mt-1.5 flex min-h-5 max-w-full justify-center">
        <EquippedBy location={weapon.location} />
      </div>
    </div>
  );
});
