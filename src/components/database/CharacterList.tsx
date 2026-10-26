"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpDown, MapPin, Star, Swords, Users } from "lucide-react";
import { RarityStars, TabEmptyState } from "@/components/inventory/shared";
import { GameIcon } from "@/components/ui/GameIcon";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { PillTabs } from "@/components/ui/PillTabs";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import {
  characterAvatarUrl,
  getAllCharacters,
  type Character,
} from "@/lib/characters";
import dynamic from "next/dynamic";
import { WEAPON_TYPE_NAMES, WEAPON_TYPES, useOwnedCharacters } from "@gi/good";
import { getRarityStyles } from "@/lib/materials/ui";
import { ELEMENT_ACCENTS, ELEMENTS, ElementTag } from "./DatabaseNav";

type SortOption = "name" | "rarity";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name (A → Z)" },
  { value: "rarity", label: "Rarity (5★ first)" },
];

/** Loaded on demand so its bundle stays out of initial page load. */
const CharacterModal = dynamic(
  () => import("./CharacterModal").then((m) => m.CharacterModal),
  { ssr: false },
);

/** The /characters page: every playable character, with the ones you own marked. */
export function CharacterList() {
  const characters = useMemo(() => getAllCharacters(), []);
  const [owned] = useOwnedCharacters();
  const [search, setSearch] = useState("");
  const [element, setElement] = useState<string>("ALL");
  const [weapon, setWeapon] = useState("ALL");
  const [rarity, setRarity] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Constellation by GOOD key; both Travelers count as owned with any Traveler
  const ownedByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of owned) {
      const key = c.key.startsWith("Traveler") ? "Traveler" : c.key;
      map.set(key, Math.max(map.get(key) ?? 0, c.constellation));
    }
    return map;
  }, [owned]);

  const regions = useMemo(
    () =>
      [
        ...new Set(characters.flatMap((c) => (c.region ? [c.region] : []))),
      ].sort(),
    [characters],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = characters.filter(
      (c) =>
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q)) &&
        (element === "ALL" || c.element === element) &&
        (weapon === "ALL" || c.weaponType === weapon) &&
        (rarity === "ALL" || c.rarity === Number(rarity)) &&
        (region === "ALL" || c.region === region),
    );
    const byName = (a: Character, b: Character) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    return sortBy === "rarity"
      ? list.sort((a, b) => b.rarity - a.rarity || byName(a, b))
      : list.sort(byName);
  }, [characters, search, element, weapon, rarity, region, sortBy]);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const selectedIndexInFiltered = useMemo(() => {
    if (!selectedCharacter) return -1;
    return filtered.findIndex((c) => c.id === selectedCharacter.id);
  }, [selectedCharacter, filtered]);

  const hasNextModal =
    selectedIndexInFiltered >= 0 &&
    selectedIndexInFiltered < filtered.length - 1;
  const hasPrevModal = selectedIndexInFiltered > 0;

  const handleNextModal = () => {
    if (hasNextModal) {
      setSelectedCharacter(filtered[selectedIndexInFiltered + 1]);
    }
  };

  const handlePrevModal = () => {
    if (hasPrevModal) {
      setSelectedCharacter(filtered[selectedIndexInFiltered - 1]);
    }
  };

  const isFiltered =
    search.trim() !== "" ||
    element !== "ALL" ||
    weapon !== "ALL" ||
    rarity !== "ALL" ||
    region !== "ALL" ||
    sortBy !== "name";
  const reset = () => {
    setSearch("");
    setElement("ALL");
    setWeapon("ALL");
    setRarity("ALL");
    setRegion("ALL");
    setSortBy("name");
  };

  return (
    <>
      {/* db/layout.tsx holds the page padding and DatabaseNav */}
      <div className="w-full space-y-6">
      <div className="glass-card glass-card--lg p-6 sm:p-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              Characters
            </h1>
          </div>
          <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
            All {characters.length} playable characters, by element, weapon and
            region. The ones in your inventory are marked with their
            constellation.
          </p>
        </div>
      </div>

      <div className="glass-card glass-card--lg space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search characters by name or title..."
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
              label="Weapon:"
              icon={<Swords className="h-3.5 w-3.5 text-cyan-300" />}
              value={weapon}
              onChange={setWeapon}
              options={[
                { value: "ALL", label: "All" },
                ...WEAPON_TYPES.map((t) => ({
                  value: t,
                  label: WEAPON_TYPE_NAMES[t],
                })),
              ]}
            />
            <PillDropdown
              label="Region:"
              icon={<MapPin className="h-3.5 w-3.5 text-cyan-300" />}
              value={region}
              onChange={setRegion}
              options={[
                { value: "ALL", label: "All" },
                ...regions.map((r) => ({ value: r, label: r })),
              ]}
            />
            <PillDropdown
              label="Rarity:"
              icon={<Star className="h-3.5 w-3.5 text-amber-300" />}
              value={rarity}
              onChange={setRarity}
              options={[
                { value: "ALL", label: "All" },
                { value: "5", label: "5★" },
                { value: "4", label: "4★" },
              ]}
            />
            <ResetFiltersButton visible={isFiltered} onReset={reset} />
          </div>
        </div>

        {/* Scrolls sideways on phones */}
        <div className="no-scrollbar -mx-4 -my-3 flex items-center gap-2 overflow-x-auto px-4 py-3">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-white/40">
            Element:
          </span>
          <PillTabs
            ariaLabel="Element"
            value={element}
            onChange={setElement}
            options={[
              { value: "ALL", label: "All", count: characters.length },
              ...ELEMENTS.map((e) => ({
                value: e,
                label: e,
                count: characters.filter((c) => c.element === e).length,
                accent: ELEMENT_ACCENTS[e],
              })),
            ]}
          />
        </div>
      </div>

      <div className="px-1 text-xs text-white/70">
        Showing{" "}
        <strong className="font-mono text-white">{filtered.length}</strong> of{" "}
        <strong className="font-mono text-white">{characters.length}</strong>{" "}
        characters
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              constellation={ownedByKey.get(c.key)}
              onSelect={setSelectedCharacter}
            />
          ))}
        </div>
      ) : (
        <TabEmptyState
          icon={Users}
          title="No characters match"
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
      </div>

      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          constellation={ownedByKey.get(selectedCharacter.key)}
          onClose={() => setSelectedCharacter(null)}
          onNavigateNext={handleNextModal}
          onNavigatePrev={handlePrevModal}
          hasNext={hasNextModal}
          hasPrev={hasPrevModal}
          total={filtered.length}
          index={selectedIndexInFiltered}
        />
      )}
    </>
  );
}

const CharacterCard = React.memo(function CharacterCard({
  character,
  constellation,
  onSelect,
}: {
  character: Character;
  /** Set when the character is in your inventory. */
  constellation?: number;
  onSelect: (character: Character) => void;
}) {
  const onClick = () => onSelect(character);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={
        {
          "--glass-accent": getRarityStyles(character.rarity).accent,
        } as React.CSSProperties
      }
      className="glass-card glass-card--hover flex cursor-pointer flex-col items-center p-4 text-center hover:transform-none motion-safe:hover:animate-squish"
    >
      {constellation !== undefined && (
        <span
          className="glass-chip absolute left-2 top-2 z-10 px-1.5 py-0 text-[10px] font-bold text-emerald-300"
          title="In your inventory"
        >
          Owned · C{constellation}
        </span>
      )}
      <div className="glass-well glass-well--tinted relative mb-2 mt-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        <GameIcon
          src={characterAvatarUrl(character.id)}
          alt={character.name}
          size={64}
          className="h-16 w-16"
          fallback={<Users className="h-7 w-7 text-white/40" />}
        />
      </div>
      <RarityStars rarity={character.rarity} className="mb-1" />
      <h2 className="text-xs font-bold leading-tight text-white">
        {character.name}
      </h2>
      <p
        className="mt-0.5 line-clamp-1 min-h-[1rem] text-[10px] text-white/50"
        title={character.title}
      >
        {character.title ?? ""}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <ElementTag element={character.element} />
        <span className="text-[11px] text-white/60">
          {WEAPON_TYPE_NAMES[character.weaponType]}
        </span>
      </div>
      {character.region && (
        <p className="mt-0.5 text-[10px] text-white/45">{character.region}</p>
      )}
    </div>
  );
});
