"use client";

import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { GameIcon } from "@/components/ui/GameIcon";
import { characterAvatarUrl, getAllCharacters } from "@/lib/characters";
import { artifactIconUrl, getAllArtifactSets, getAllWeapons, weaponIconUrl } from "@gi/good";
import { SLOT_KEYS, SLOT_NAMES } from "@gi/good";
import { getRarityStyles } from "@/lib/materials/ui";
import type { EquipmentReviewItem } from "@/lib/types";
import { useModalMotion } from "@/lib/hooks";

/** Most options rendered at once; narrowing the search shows the rest. */
const MAX_OPTIONS = 120;

export interface EquipmentOption {
  /** A weapon id or "<set id>:<slot>". */
  id: string;
  name: string;
  /** Set and slot of an artifact piece, the type of a weapon. */
  detail: string;
  rarity: number;
  icon: string;
}

let weaponOptions: EquipmentOption[] | null = null;
let artifactOptions: EquipmentOption[] | null = null;
let characterOptions: EquipmentOption[] | null = null;

function optionsFor(kind: EquipmentReviewItem["kind"]): EquipmentOption[] {
  if (kind === "character") {
    characterOptions ??= getAllCharacters().map((c) => ({
      id: c.id,
      name: c.name,
      detail: [c.element !== "None" ? c.element : "", c.weaponType[0].toUpperCase() + c.weaponType.slice(1)]
        .filter(Boolean)
        .join(" · "),
      rarity: c.rarity,
      icon: characterAvatarUrl(c.id),
    }));
    return characterOptions;
  }
  if (kind === "weapon") {
    weaponOptions ??= getAllWeapons().map((w) => ({
      id: w.id,
      name: w.name,
      detail: w.type[0].toUpperCase() + w.type.slice(1),
      rarity: w.rarity,
      icon: weaponIconUrl(w.id),
    }));
    return weaponOptions;
  }
  artifactOptions ??= getAllArtifactSets().flatMap((set) =>
    SLOT_KEYS.filter((slot) => set.pieces[slot]).map((slot) => ({
      id: `${set.id}:${slot}`,
      name: set.pieces[slot]!,
      detail: `${set.name} · ${SLOT_NAMES[slot]}`,
      rarity: Math.max(...set.rarities),
      icon: artifactIconUrl(set.id, slot),
    })),
  );
  return artifactOptions;
}

interface EquipmentPickerModalProps {
  /** Review row being reassigned (its crop and current item are shown). */
  item: EquipmentReviewItem;
  onSelect: (rowId: string, option: EquipmentOption) => void;
  onClose: () => void;
}

/** Weapon or artifact-piece picker opened from a scan review row's "Change" button. */
export function EquipmentPickerModal({ item, onSelect, onClose }: EquipmentPickerModalProps) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<number | null>(null);
  const options = useMemo(() => optionsFor(item.kind), [item.kind]);
  const deferredSearch = useDeferredValue(search);
  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    return options.filter(
      (o) =>
        (rarity === null || o.rarity === rarity) &&
        (!q || o.name.toLowerCase().includes(q) || o.detail.toLowerCase().includes(q)),
    );
  }, [options, deferredSearch, rarity]);

  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);
  const handleSelect = useCallback(
    (option: EquipmentOption) => closeThen(() => onSelect(item.id, option)),
    [closeThen, onSelect, item.id],
  );
  const noun = item.kind === "artifact" ? "artifact piece" : item.kind;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div ref={backdropRef} className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={close} />
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="glass-well relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
              {item.imageSnippet ? (
                <img src={item.imageSnippet} alt="Card from the screenshot" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-white/40">Crop</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select the {noun}</h3>
              <p className="text-xs text-white/60">
                Currently: <span className="font-semibold text-white/90">{item.name}</span>
              </p>
            </div>
          </div>
          <button onClick={close} className="glass-icon-btn h-8 w-8 rounded-full" aria-label="Close picker">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 border-b border-white/10 p-4">
          <GlassInput
            placeholder={
              item.kind === "weapon"
                ? "Search weapons by name or type..."
                : item.kind === "character"
                  ? "Search characters by name or element..."
                  : "Search pieces by name, set or slot..."
            }
            value={search}
            onValueChange={setSearch}
            autoFocus
            enterKeyHint="search"
            icon={Search}
            clearable
            shape="pill"
            size="sm"
          />
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <button
              onClick={() => setRarity(null)}
              aria-pressed={rarity === null}
              className="glass-chip px-2.5 py-0.5 text-[11px] font-semibold"
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                aria-pressed={rarity === r}
                className="glass-chip px-2.5 py-0.5 text-[11px] font-semibold"
              >
                {r}★
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-white/50">Nothing matches &ldquo;{search}&rdquo;</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filtered.slice(0, MAX_OPTIONS).map((o) => {
                const styles = getRarityStyles(o.rarity);
                return (
                  <button
                    key={o.id}
                    onClick={() => handleSelect(o)}
                    aria-pressed={o.id === item.item}
                    style={{ "--glass-accent": styles.accent } as React.CSSProperties}
                    className="glass-card flex items-center gap-3 p-2 text-left transition-transform hover:scale-[1.01]"
                  >
                    <div className="glass-well glass-well--tinted flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
                      <GameIcon src={o.icon} alt={o.name} size={40} className="h-10 w-10" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-bold text-white">{o.name}</span>
                      <span className="block truncate text-[10px] text-white/50">
                        <span className={styles.starColor}>{o.rarity}★</span> · {o.detail}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {filtered.length > MAX_OPTIONS && (
            <p className="pt-3 text-center text-[11px] text-white/45">
              Showing {MAX_OPTIONS} of {filtered.length}. Search to narrow it down.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
