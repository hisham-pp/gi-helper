"use client";

import { artifactIconUrl, getArtifactSetById, getWeaponById, weaponIconUrl } from "@/lib/good/catalog";
import { SLOT_NAMES, type OwnedArtifact, type OwnedWeapon } from "@/lib/good/types";
import { newEntryId, setOwnedArtifacts, setOwnedWeapons } from "@/lib/good-inventory";
import {
  fixedMainStat,
  splitArtifactItem,
  toGoodArtifact,
  toGoodWeapon,
  type EquipmentKind,
  type EquipmentSighting,
} from "@/lib/scan-equipment";
import type { EquipmentReviewItem } from "@/lib/types";

/**
 * Between the scanners and the inventory for weapons and artifacts: review
 * rows from stitched cards, and saving what the review confirms.
 */

/** The name shown for a scanned weapon or artifact piece. */
export function equipmentName(kind: EquipmentKind, item: string | null): string {
  if (!item) return "Unidentified";
  if (kind === "weapon") return getWeaponById(item)?.name ?? item;
  const { setId, slot } = splitArtifactItem(item);
  return getArtifactSetById(setId)?.pieces[slot] ?? item;
}

/** The catalog icon of a weapon or artifact piece, shown when its card couldn't be cropped. */
export function equipmentIcon(s: Pick<EquipmentSighting, "kind" | "item">): string {
  if (!s.item) return "";
  if (s.kind === "weapon") return weaponIconUrl(s.item);
  const { setId, slot } = splitArtifactItem(s.item);
  return artifactIconUrl(setId, slot);
}

/** Where a confirmed scan lands: the inventory page of what it found most of. */
export function inventoryPageFor(
  materials: number,
  weapons: number,
  artifacts: number,
): "/inventory/materials" | "/inventory/weapons" | "/inventory/artifacts" {
  const most = Math.max(materials, weapons, artifacts);
  if (materials === most) return "/inventory/materials";
  return weapons === most ? "/inventory/weapons" : "/inventory/artifacts";
}

/** "Gladiator's Finale · Flower of Life", for an artifact piece. */
export function artifactPieceDetail(item: string): string {
  const { setId, slot } = splitArtifactItem(item);
  const set = getArtifactSetById(setId);
  return [set?.name, SLOT_NAMES[slot]].filter(Boolean).join(" · ");
}

function reviewReason(s: EquipmentSighting): string | undefined {
  if (!s.item) return "Not identified";
  if (s.status !== "matched") return "Low confidence";
  if (s.level === null) return "Level unreadable";
  return undefined;
}

export function equipmentReviewItem(
  s: EquipmentSighting,
  id: string,
  imageSnippet: string,
  sourceImageName: string,
): EquipmentReviewItem {
  const fixed = s.kind === "artifact" && s.item ? fixedMainStat(splitArtifactItem(s.item).slot) : null;
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
    mainStatKey: fixed ?? "",
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
 * Saves confirmed weapons and artifacts to the inventory. Rows still
 * unidentified are skipped. Who holds an item isn't read, so `location` is
 * empty; artifacts carry no substats yet.
 */
export function saveScannedEquipment({ items, replace }: EquipmentConfirm) {
  const weapons: OwnedWeapon[] = [];
  const artifacts: OwnedArtifact[] = [];
  let skipped = 0;
  for (const it of items) {
    if (!it.item) {
      skipped++;
      continue;
    }
    if (it.kind === "weapon") {
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
      artifacts.push({ ...toGoodArtifact(piece, set, slot, it.mainStatKey || null), id: newEntryId("a") });
    }
  }
  if (items.some((i) => i.kind === "weapon")) {
    setOwnedWeapons((prev) => (replace.weapon ? weapons : [...prev, ...weapons]));
  }
  if (items.some((i) => i.kind === "artifact")) {
    setOwnedArtifacts((prev) => (replace.artifact ? artifacts : [...prev, ...artifacts]));
  }
  return { weapons: weapons.length, artifacts: artifacts.length, skipped };
}
