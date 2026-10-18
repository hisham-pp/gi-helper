"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ArrowUpDown, FileUp, ScanLine, Trash2, Users } from "lucide-react";
import { ShellLink } from "@/components/layout/ShellLink";
import { toast } from "sonner";
import { GameIcon } from "@/components/ui/GameIcon";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { SearchField } from "@/components/ui/SearchField";
import { useConfirm } from "@/components/ui/use-confirm";
import { characterAvatarUrl } from "@/lib/characters";
import { describeCharacter, type CharacterInfo } from "@/lib/good/catalog";
import { formatLevel, type GoodCharacter } from "@/lib/good/types";
import { useOwnedCharacters } from "@/lib/good/inventory";
import { getRarityStyles } from "@/lib/materials/ui";
import { RarityStars, ResultsCounter, TabEmptyState, useHydrated } from "./shared";
import { useInventoryActions } from "./InventoryShell";

type SortOption = "level" | "constellation" | "rarity" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "level", label: "Level (high → low)" },
  { value: "constellation", label: "Constellation" },
  { value: "rarity", label: "Rarity (5★ first)" },
  { value: "name", label: "Name (A → Z)" },
];

interface Entry {
  character: GoodCharacter;
  info: CharacterInfo;
}

/** The Characters tab of /inventory: owned characters with level, constellation and talents. */
export function CharactersInventory() {
  const { openImport: onImport } = useInventoryActions();
  const hydrated = useHydrated();
  const [characters, setCharacters] = useOwnedCharacters();
  const { confirm, confirmModal } = useConfirm();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("level");

  const entries = useMemo<Entry[]>(
    () => characters.map((character) => ({ character, info: describeCharacter(character.key) })),
    [characters],
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? entries.filter((e) => e.info.name.toLowerCase().includes(q)) : entries;
    const byName = (a: Entry, b: Entry) => a.info.name.localeCompare(b.info.name, "en", { sensitivity: "base" });
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "constellation":
          return b.character.constellation - a.character.constellation || byName(a, b);
        case "rarity":
          return (b.info.rarity ?? 0) - (a.info.rarity ?? 0) || b.character.level - a.character.level || byName(a, b);
        case "name":
          return byName(a, b);
        default:
          return b.character.level - a.character.level || byName(a, b);
      }
    });
  }, [entries, search, sortBy]);

  const handleRemove = useCallback(
    (key: string) => setCharacters((prev) => prev.filter((c) => c.key !== key)),
    [setCharacters],
  );

  const handleClear = useCallback(async () => {
    const confirmed = await confirm({
      title: "Remove all characters?",
      message: "Every character is removed from this browser. Export to GOOD first if you want to keep them.",
      confirmLabel: "Remove All",
      tone: "danger",
      icon: Trash2,
    });
    if (!confirmed) return;
    setCharacters([]);
    toast.success("Characters removed");
  }, [confirm, setCharacters]);

  // Nothing until the browser's copy is read, so the empty state doesn't flash
  if (!hydrated) return null;

  if (characters.length === 0) {
    return (
      <TabEmptyState
        icon={Users}
        title="No characters yet"
        text="Scan screenshots or a recording of the party setup's character list (their levels), or import a GOOD file from Genshin Optimizer or another scanner for constellations and talents too."
      >
        <ShellLink href="/" className="glass-btn glass-btn--primary px-5 py-2 text-xs">
          <ScanLine className="h-4 w-4" /> Scan screenshots
        </ShellLink>
        <button onClick={onImport} className="glass-btn px-5 py-2 text-xs">
          <FileUp className="h-4 w-4" /> Import .GOOD
        </button>
      </TabEmptyState>
    );
  }

  return (
    <>
      <div className="glass-card glass-card--lg p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Search your characters..." />
          <PillDropdown
            label="Sort:"
            icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
            value={sortBy}
            onChange={(v) => setSortBy(v as SortOption)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <ResultsCounter shown={shown.length} total={characters.length} noun="characters">
        <button onClick={handleClear} className="glass-btn glass-btn--danger px-3 py-1.5 text-xs">
          <Trash2 className="h-3.5 w-3.5" /> Remove all
        </button>
      </ResultsCounter>

      {shown.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {shown.map((entry) => (
            <CharacterCard key={entry.character.key} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      )}
      {confirmModal}
    </>
  );
}

const CharacterCard = React.memo(function CharacterCard({
  entry: { character, info },
  onRemove,
}: {
  entry: Entry;
  onRemove: (key: string) => void;
}) {
  const rarity = info.rarity ?? 4;
  return (
    <div
      style={{ "--glass-accent": getRarityStyles(rarity).accent } as React.CSSProperties}
      className="glass-card glass-card--hover group flex flex-col items-center p-4 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      <button
        onClick={() => onRemove(character.key)}
        className="glass-icon-btn absolute right-2 top-2 z-10 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100 focus-visible:opacity-100"
        title="Remove character"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="glass-well glass-well--tinted relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        <GameIcon
          src={info.avatarId ? characterAvatarUrl(info.avatarId) : null}
          alt={info.name}
          size={64}
          className="h-16 w-16"
          fallback={<Users className="h-7 w-7 text-white/40" />}
        />
        {character.constellation > 0 && (
          <span className="glass-chip absolute bottom-0.5 right-0.5 z-10 px-1.5 py-0 font-mono text-[10px] font-bold text-white">
            C{character.constellation}
          </span>
        )}
      </div>

      <RarityStars rarity={rarity} className="mb-1" />
      <h3 className="line-clamp-2 min-h-[2rem] text-xs font-bold leading-tight text-white" title={info.name}>
        {info.name}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-white/70">Lv. {formatLevel(character.level, character.ascension)}</p>
      <p
        className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-white/80"
        title="Talent levels: normal attack, skill, burst (without constellation boosts)"
      >
        <span className="glass-chip px-1.5 py-0">{character.talent.auto}</span>
        <span className="glass-chip px-1.5 py-0">{character.talent.skill}</span>
        <span className="glass-chip px-1.5 py-0">{character.talent.burst}</span>
      </p>
    </div>
  );
});
