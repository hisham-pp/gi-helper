"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, FileUp, Flower2, Layers, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GameIcon } from "@/components/ui/GameIcon";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import { useConfirm } from "@/components/ui/use-confirm";
import {
  artifactIconUrl,
  getArtifactSet,
  nameFromKey,
  type ArtifactSetInfo,
} from "@/lib/good/catalog";
import {
  formatStat,
  SLOT_KEYS,
  SLOT_NAMES,
  STAT_NAMES,
  type OwnedArtifact,
  type StatKey,
} from "@/lib/good/types";
import { useOwnedArtifacts } from "@/lib/good-inventory";
import { getRarityStyles } from "@/lib/material-ui";
import { EquippedBy, LockBadge, paginate, RarityStars, ResultsCounter, TabEmptyState } from "./shared";

type SortOption = "level" | "rarity" | "set";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "level", label: "Level (high → low)" },
  { value: "rarity", label: "Rarity (5★ first)" },
  { value: "set", label: "Set (A → Z)" },
];

const PAGE_SIZE = 36;
const SLOT_ORDER = new Map(SLOT_KEYS.map((s, i) => [s, i]));

interface Entry {
  artifact: OwnedArtifact;
  set?: ArtifactSetInfo;
  setName: string;
}

/** The Artifacts tab of /inventory: every piece with its stats and who wears it. */
export function ArtifactsInventory({ onImport }: { onImport: () => void }) {
  const [artifacts, setArtifacts] = useOwnedArtifacts();
  const { confirm, confirmModal } = useConfirm();
  const [search, setSearch] = useState("");
  const [setKey, setSetKey] = useState("ALL");
  const [slot, setSlot] = useState("ALL");
  const [rarity, setRarity] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("level");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, setKey, slot, rarity, sortBy]);

  const entries = useMemo<Entry[]>(
    () =>
      artifacts.map((artifact) => {
        const set = getArtifactSet(artifact.setKey);
        return { artifact, set, setName: set?.name ?? nameFromKey(artifact.setKey) };
      }),
    [artifacts],
  );

  // Sets you have pieces of, for the filter
  const setOptions = useMemo(() => {
    const counts = new Map<string, { name: string; n: number }>();
    for (const e of entries) {
      const c = counts.get(e.artifact.setKey) ?? { name: e.setName, n: 0 };
      c.n += 1;
      counts.set(e.artifact.setKey, c);
    }
    return [...counts.entries()]
      .sort((a, b) => a[1].name.localeCompare(b[1].name, "en", { sensitivity: "base" }))
      .map(([key, { name, n }]) => ({ value: key, label: `${name} (${n})` }));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = entries.filter((e) => {
      const a = e.artifact;
      if (setKey !== "ALL" && a.setKey !== setKey) return false;
      if (slot !== "ALL" && a.slotKey !== slot) return false;
      if (rarity !== "ALL" && a.rarity !== Number(rarity)) return false;
      if (!q) return true;
      const stats = [a.mainStatKey, ...a.substats.map((s) => s.key)]
        .map((k) => STAT_NAMES[k as StatKey] ?? k)
        .join(" ");
      return `${e.setName} ${e.set?.pieces[a.slotKey] ?? ""} ${stats}`.toLowerCase().includes(q);
    });
    const bySet = (a: Entry, b: Entry) =>
      a.setName.localeCompare(b.setName, "en", { sensitivity: "base" }) ||
      (SLOT_ORDER.get(a.artifact.slotKey) ?? 0) - (SLOT_ORDER.get(b.artifact.slotKey) ?? 0);
    return list.sort((a, b) => {
      switch (sortBy) {
        case "rarity":
          return b.artifact.rarity - a.artifact.rarity || b.artifact.level - a.artifact.level || bySet(a, b);
        case "set":
          return bySet(a, b) || b.artifact.level - a.artifact.level;
        default:
          return b.artifact.level - a.artifact.level || b.artifact.rarity - a.artifact.rarity || bySet(a, b);
      }
    });
  }, [entries, search, setKey, slot, rarity, sortBy]);

  const { pageItems, page: currentPage, totalPages } = paginate(filtered, page, PAGE_SIZE);
  const isFiltered =
    search.trim() !== "" || setKey !== "ALL" || slot !== "ALL" || rarity !== "ALL" || sortBy !== "level";

  const handleRemove = useCallback(
    (id: string) => setArtifacts((prev) => prev.filter((a) => a.id !== id)),
    [setArtifacts],
  );

  const handleClear = useCallback(async () => {
    const confirmed = await confirm({
      title: "Remove all artifacts?",
      message: "Every artifact is removed from this browser. Export to GOOD first if you want to keep them.",
      confirmLabel: "Remove All",
      tone: "danger",
      icon: Trash2,
    });
    if (!confirmed) return;
    setArtifacts([]);
    toast.success("Artifacts removed");
  }, [confirm, setArtifacts]);

  if (artifacts.length === 0) {
    return (
      <TabEmptyState
        icon={Flower2}
        title="No artifacts yet"
        text="Import a GOOD file from Genshin Optimizer or another scanner to bring in your artifacts. Scanning them is on the roadmap."
      >
        <button onClick={onImport} className="glass-btn glass-btn--primary px-5 py-2 text-xs">
          <FileUp className="h-4 w-4" /> Import .GOOD
        </button>
      </TabEmptyState>
    );
  }

  return (
    <>
      <div className="glass-card glass-card--lg p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search by set, piece or stat..." />
          <div className="flex flex-wrap items-center gap-2.5">
            <PillDropdown
              label="Sort:"
              icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={SORT_OPTIONS}
            />
            <PillDropdown
              label="Set:"
              icon={<Layers className="h-3.5 w-3.5 text-cyan-300" />}
              value={setKey}
              onChange={setSetKey}
              options={[{ value: "ALL", label: `All (${entries.length})` }, ...setOptions]}
            />
            <PillDropdown
              label="Slot:"
              icon={<Flower2 className="h-3.5 w-3.5 text-cyan-300" />}
              value={slot}
              onChange={setSlot}
              options={[
                { value: "ALL", label: `All (${entries.length})` },
                ...SLOT_KEYS.map((s) => ({
                  value: s,
                  label: `${SLOT_NAMES[s]} (${entries.filter((e) => e.artifact.slotKey === s).length})`,
                })),
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
                  label: `${r}★ (${entries.filter((e) => e.artifact.rarity === r).length})`,
                })),
              ]}
            />
            <ResetFiltersButton
              visible={isFiltered}
              onReset={() => {
                setSearch("");
                setSetKey("ALL");
                setSlot("ALL");
                setRarity("ALL");
                setSortBy("level");
              }}
            />
          </div>
        </div>
      </div>

      <ResultsCounter
        shown={filtered.length}
        total={artifacts.length}
        noun="artifacts"
        page={currentPage}
        totalPages={totalPages}
      >
        <button onClick={handleClear} className="glass-btn glass-btn--danger px-3 py-1.5 text-xs">
          <Trash2 className="h-3.5 w-3.5" /> Remove all
        </button>
      </ResultsCounter>

      {pageItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((entry) => (
            <ArtifactCard key={entry.artifact.id} entry={entry} onRemove={handleRemove} />
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

const ArtifactCard = React.memo(function ArtifactCard({
  entry: { artifact, set, setName },
  onRemove,
}: {
  entry: Entry;
  onRemove: (id: string) => void;
}) {
  const pieceName = set?.pieces[artifact.slotKey] ?? SLOT_NAMES[artifact.slotKey];
  return (
    <div
      style={{ "--glass-accent": getRarityStyles(artifact.rarity).accent } as React.CSSProperties}
      className="glass-card glass-card--hover group flex flex-col gap-3 p-4 hover:transform-none motion-safe:hover:animate-squish"
    >
      <button
        onClick={() => onRemove(artifact.id)}
        className="glass-icon-btn absolute right-2 top-2 z-10 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus-visible:opacity-100"
        title="Remove artifact"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="glass-well glass-well--tinted relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          <GameIcon
            src={set ? artifactIconUrl(set.id, artifact.slotKey) : null}
            alt={pieceName}
            size={64}
            className="h-14 w-14"
            fallback={<Flower2 className="h-7 w-7 text-white/40" />}
          />
          <span className="glass-chip absolute bottom-0.5 right-0.5 z-10 px-1.5 py-0 font-mono text-[10px] font-bold text-white">
            +{artifact.level}
          </span>
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <RarityStars rarity={artifact.rarity} />
          <h3 className="truncate text-xs font-bold text-white" title={pieceName}>
            {pieceName}
          </h3>
          <p className="truncate text-[11px] text-white/60" title={setName}>
            {setName}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="flex items-center justify-between gap-2 text-xs font-bold text-white">
          <span className="truncate">{STAT_NAMES[artifact.mainStatKey as StatKey] ?? artifact.mainStatKey}</span>
          <LockBadge locked={artifact.lock} />
        </p>
        <ul className="space-y-0.5 text-[11px] text-white/75">
          {artifact.substats.map((s, i) => (
            <li key={i} className="truncate">
              · {formatStat(s.key, s.value)}
            </li>
          ))}
          {artifact.unactivatedSubstats?.map((s, i) => (
            <li key={`u${i}`} className="truncate text-white/45" title="Not activated yet">
              · {formatStat(s.key, s.value)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex min-h-5">
        <EquippedBy location={artifact.location} />
      </div>
    </div>
  );
});
