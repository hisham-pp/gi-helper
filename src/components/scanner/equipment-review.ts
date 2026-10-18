"use client";

import { characterAvatarUrl, getCharacter } from "@/lib/characters";
import { artifactIconUrl, getArtifactSetById, getWeaponById, weaponIconUrl } from "@/lib/good/catalog";
import { SLOT_NAMES, type GoodCharacter, type OwnedArtifact, type OwnedWeapon } from "@/lib/good/types";
import { newEntryId, setOwnedArtifacts, setOwnedCharacters, setOwnedWeapons } from "@/lib/good/inventory";
import type { ArtifactPanelReading } from "@/lib/artifact-panel/read";
import type { ArtifactPanelScan } from "@/lib/artifact-panel/types";
import {
  attachPanel,
  fixedMainStat,
  panelArtBox,
  splitArtifactItem,
  toGoodArtifact,
  toGoodCharacter,
  toGoodWeapon,
  type EquipmentKind,
  type EquipmentSighting,
} from "@/lib/scanner/equipment";
import type { EquipmentReviewItem } from "@/lib/types";

/**
 * Between the scanners and the inventory for weapons, artifacts and
 * characters: review rows from stitched cards (with what an artifact's
 * detail panel adds), and saving what the review confirms.
 */

/**
 * Reads the artifact detail panel a scan found (the OCR is downloaded on
 * first use) and attaches it to the card it describes among that frame's
 * artifact rows. `standalone` is an artifact seen only in its panel.
 */
export async function readAndAttachPanel(
  panel: ArtifactPanelScan,
  rows: EquipmentSighting[][],
  source: number,
  read?: (scan: ArtifactPanelScan) => Promise<ArtifactPanelReading | null>,
): Promise<{ rows: EquipmentSighting[][]; standalone: EquipmentSighting | null; reading: ArtifactPanelReading | null }> {
  const reading = await (read ?? (async (scan) => (await import("@/lib/artifact-panel/browser")).readPanel(scan)))(panel);
  if (!reading) return { rows, standalone: null, reading: null };
  return { ...attachPanel(rows, reading, panel.highlights, source, panelArtBox(panel.bounds)), reading };
}

/** The Traveler's elements, as in GOOD keys ("TravelerAnemo"). */
export const TRAVELER_ELEMENTS = ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"] as const;

/** Aether and Lumine: one GOOD Traveler, keyed by element. */
export const isTraveler = (item: string | null) => getCharacter(item)?.key === "Traveler";

/** The name shown for a scanned weapon, artifact piece or character. */
export function equipmentName(kind: EquipmentKind, item: string | null): string {
  if (!item) return "Unidentified";
  if (kind === "weapon") return getWeaponById(item)?.name ?? item;
  if (kind === "character") return getCharacter(item)?.name ?? item;
  const { setId, slot } = splitArtifactItem(item);
  return getArtifactSetById(setId)?.pieces[slot] ?? item;
}

/** The catalog icon of a weapon, artifact piece or character, shown when its card couldn't be cropped. */
export function equipmentIcon(s: Pick<EquipmentSighting, "kind" | "item">): string {
  if (!s.item) return "";
  if (s.kind === "weapon") return weaponIconUrl(s.item);
  if (s.kind === "character") return characterAvatarUrl(s.item);
  const { setId, slot } = splitArtifactItem(s.item);
  return artifactIconUrl(setId, slot);
}

type InventoryPage = "/inventory/materials" | "/inventory/weapons" | "/inventory/artifacts" | "/inventory/characters";

/** Where a confirmed scan lands: the inventory page of what it found most of. */
export function inventoryPageFor(counts: { materials: number; weapons: number; artifacts: number; characters: number }): InventoryPage {
  const pages: [number, InventoryPage][] = [
    [counts.materials, "/inventory/materials"],
    [counts.weapons, "/inventory/weapons"],
    [counts.artifacts, "/inventory/artifacts"],
    [counts.characters, "/inventory/characters"],
  ];
  return pages.reduce((best, p) => (p[0] > best[0] ? p : best))[1];
}

/** "Gladiator's Finale · Flower of Life", for an artifact piece. */
export function artifactPieceDetail(item: string): string {
  const { setId, slot } = splitArtifactItem(item);
  const set = getArtifactSetById(setId);
  return [set?.name, SLOT_NAMES[slot]].filter(Boolean).join(" · ");
}

function reviewReason(s: EquipmentSighting): string | undefined {
  if (!s.item) return "Not identified";
  // What the detail panel couldn't read or check comes first: it's the part a glance at the card can't fix.
  if (s.panel?.issues.length) return s.panel.issues.length > 1 ? `${s.panel.issues[0]} (+${s.panel.issues.length - 1})` : s.panel.issues[0];
  if (s.status !== "matched") return "Low confidence";
  if (s.level === null) return "Level unreadable";
  return undefined;
}

/** The element of the Traveler already in the inventory, used as the default for a scanned one. */
export function ownedTravelerElement(characters: readonly GoodCharacter[]): string {
  return characters.map((c) => c.key.match(/^Traveler(\w+)$/)?.[1]).find(Boolean) ?? "Anemo";
}

export function equipmentReviewItem(
  s: EquipmentSighting,
  id: string,
  imageSnippet: string,
  sourceImageName: string,
  travelerElement = "Anemo",
): EquipmentReviewItem {
  const fixed = s.kind === "artifact" && s.item ? fixedMainStat(splitArtifactItem(s.item).slot) : null;
  const panel = s.kind === "artifact" ? s.panel : undefined;
  return {
    id,
    kind: s.kind,
    item: s.item,
    name: equipmentName(s.kind, s.item),
    rarity: s.rarity ?? undefined,
    ...(s.variant ? { variant: s.variant } : {}),
    level: s.level ?? (s.kind === "weapon" ? 1 : 0),
    refinement: s.refinement ?? 1,
    locked: s.locked,
    mainStatKey: fixed ?? panel?.mainStatKey ?? "",
    ...(panel
      ? {
          fromPanel: true,
          ...(panel.mainStatValue !== null ? { mainStatValue: panel.mainStatValue } : {}),
          substats: panel.substats.map((x) => ({ ...x })),
          unactivatedSubstats: panel.unactivatedSubstats.map((x) => ({ ...x })),
          location: panel.location,
        }
      : {}),
    ...(s.kind === "character" && isTraveler(s.item) ? { element: travelerElement } : {}),
    imageSnippet,
    sourceImageName,
    candidates: s.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      rarity: c.rarity,
      confidence: Math.round(c.confidence * 100),
    })),
    reviewReason: reviewReason(s),
  };
}

export interface EquipmentConfirm {
  items: EquipmentReviewItem[];
  /** Per kind: replace what the inventory holds (a scan of the whole tab) instead of adding. */
  replace: Record<EquipmentKind, boolean>;
}

/**
 * Saves confirmed weapons, artifacts and characters to the inventory. Rows
 * still unidentified are skipped. Artifacts whose detail panel was read
 * carry its substats and who wears them; otherwise (and for weapons)
 * `location` is empty and there are no substats. Characters are
 * merged by key (see toGoodCharacter); weapons and artifacts replace or add
 * to what's stored, per `replace`.
 */
export function saveScannedEquipment({ items, replace }: EquipmentConfirm) {
  const weapons: OwnedWeapon[] = [];
  const artifacts: OwnedArtifact[] = [];
  const characters: { key: string; level: number }[] = [];
  let skipped = 0;
  for (const it of items) {
    if (!it.item) {
      skipped++;
      continue;
    }
    if (it.kind === "character") {
      const character = getCharacter(it.item);
      if (!character) {
        skipped++;
        continue;
      }
      const key = character.key === "Traveler" ? `Traveler${it.element ?? "Anemo"}` : character.key;
      characters.push({ key, level: it.level });
    } else if (it.kind === "weapon") {
      const info = getWeaponById(it.item);
      if (!info) {
        skipped++;
        continue;
      }
      weapons.push({ ...toGoodWeapon(it, info), id: newEntryId("w") });
    } else {
      const { setId, slot } = splitArtifactItem(it.item);
      const set = getArtifactSetById(setId);
      if (!set) {
        skipped++;
        continue;
      }
      const piece = { rarity: it.rarity ?? null, level: it.level, locked: it.locked };
      const details = { substats: it.substats, unactivatedSubstats: it.unactivatedSubstats, location: it.location };
      artifacts.push({ ...toGoodArtifact(piece, set, slot, it.mainStatKey || null, details), id: newEntryId("a") });
    }
  }
  if (items.some((i) => i.kind === "weapon")) {
    setOwnedWeapons((prev) => (replace.weapon ? weapons : [...prev, ...weapons]));
  }
  if (items.some((i) => i.kind === "artifact")) {
    setOwnedArtifacts((prev) => (replace.artifact ? artifacts : [...prev, ...artifacts]));
  }
  if (characters.length > 0) {
    setOwnedCharacters((prev) => {
      const byKey = new Map(prev.map((c) => [c.key, c]));
      for (const { key, level } of characters) byKey.set(key, toGoodCharacter(key, level, byKey.get(key)));
      return [...byKey.values()];
    });
  }
  return { weapons: weapons.length, artifacts: artifacts.length, characters: characters.length, skipped };
}
