import pkg from "../../../package.json";
import type { MaterialItem } from "@/lib/types";

/**
 * Material categories, labels, icon URLs and rarity styles. No catalog data
 * here, so client code that only needs these (the scanners, cards, modals)
 * doesn't pull the 300 KB materials.json into its bundle; that lives in
 * ./materials.ts (getAllMaterials), which also re-exports all of this.
 */

export type MaterialCategory =
  | "ALL"
  | "EXP"
  | "REFINEMENT"
  | "ENHANCEMENT"
  | "BOSS"
  | "GEM"
  | "TALENT"
  | "WEAPON"
  | "SPECIALTY"
  | "INGREDIENT"
  | "FISHING"
  | "CRAFTING";

export interface CategoryMeta {
  id: MaterialCategory;
  label: string;
  shortLabel: string;
  description: string;
  sortRankRange: string;
  /** RGB triplet for the category's filter tab (fill and glow when selected). */
  accent: string;
}

export const MATERIAL_CATEGORIES: CategoryMeta[] = [
  {
    id: "ALL",
    label: "All Materials",
    shortLabel: "All",
    description: "Every material available in the game",
    sortRankRange: "1 - 15124",
    accent: "34, 211, 238",
  },
  {
    id: "EXP",
    label: "Character & Weapon EXP",
    shortLabel: "EXP Materials",
    description: "Hero's Wit, Adventurer's Experience, and Enhancement Ores",
    sortRankRange: "5 - 100",
    accent: "167, 139, 250",
  },
  {
    id: "REFINEMENT",
    label: "Refinement Material",
    shortLabel: "Refinement",
    description: "Specialized event weapon refinement items",
    sortRankRange: "90",
    accent: "251, 191, 36",
  },
  {
    id: "ENHANCEMENT",
    label: "Character & Weapon Enhancement",
    shortLabel: "Common / Mob",
    description: "Enemy drops and common enhancement materials",
    sortRankRange: "10105 - 10640",
    accent: "52, 211, 153",
  },
  {
    id: "BOSS",
    label: "Boss & Level-Up Material",
    shortLabel: "Boss Drops",
    description: "Normal boss and weekly trounce domain materials",
    sortRankRange: "11101",
    accent: "251, 113, 133",
  },
  {
    id: "GEM",
    label: "Character Ascension Gem",
    shortLabel: "Gems",
    description: "Elemental slivers, fragments, chunks, and gemstones",
    sortRankRange: "12101 - 12108",
    accent: "232, 121, 249",
  },
  {
    id: "TALENT",
    label: "Character Talent Material",
    shortLabel: "Talent Books",
    description: "Teachings, guides, philosophies, and crowns",
    sortRankRange: "13101 - 14101",
    accent: "251, 146, 60",
  },
  {
    id: "WEAPON",
    label: "Weapon Ascension Material",
    shortLabel: "Weapon Mats",
    description: "Domain-forged weapon ascension materials",
    sortRankRange: "15101 - 15124",
    accent: "96, 165, 250",
  },
  // The Materials tab of the bag (other-materials.json)
  {
    id: "SPECIALTY",
    label: "Local Specialty",
    shortLabel: "Local Specialties",
    description: "Plants and minerals found in each region",
    sortRankRange: "Materials tab",
    accent: "163, 230, 53",
  },
  {
    id: "INGREDIENT",
    label: "Cooking Ingredient",
    shortLabel: "Ingredients",
    description: "Ingredients for cooking",
    sortRankRange: "Materials tab",
    accent: "250, 204, 21",
  },
  {
    id: "FISHING",
    label: "Fish & Bait",
    shortLabel: "Fish & Bait",
    description: "Fish and fishing bait",
    sortRankRange: "Materials tab",
    accent: "45, 212, 191",
  },
  {
    id: "CRAFTING",
    label: "Ores, Wood & Crafting",
    shortLabel: "Ores & Wood",
    description: "Forging ores, wood and other crafting materials",
    sortRankRange: "Materials tab",
    accent: "148, 163, 184",
  },
];

const OTHER_CATEGORIES = new Set<string>(["SPECIALTY", "INGREDIENT", "FISHING", "CRAFTING"]);

/**
 * Returns the category ID of a material based on its sortRank and in-game semantics.
 */
export function getMaterialCategoryId(item: MaterialItem): MaterialCategory {
  if (item.category && OTHER_CATEGORIES.has(item.category)) {
    return item.category as MaterialCategory;
  }
  if (
    item.type === "EXP_FRUIT" ||
    item.type === "WEAPON_EXP_STONE" ||
    item.name.includes("Hero's Wit") ||
    item.name.includes("Adventurer's Experience") ||
    item.name.includes("Wanderer's Advice") ||
    item.name.includes("Enhancement Ore")
  ) {
    return "EXP";
  }

  const rank = item.sortRank ?? 0;
  if (
    rank <= 90 ||
    item.description.toLowerCase().includes("refinement material")
  ) {
    return "REFINEMENT";
  }
  if (rank >= 10105 && rank <= 10640) {
    return "ENHANCEMENT";
  }
  if (rank === 11101) {
    return "BOSS";
  }
  if (rank >= 12101 && rank <= 12108) {
    return "GEM";
  }
  if (rank >= 13101 && rank <= 14101) {
    return "TALENT";
  }
  if (rank >= 15101 && rank <= 15124) {
    return "WEAPON";
  }
  return "ENHANCEMENT";
}

/** Materials-tab items (other-materials.json) are ordered after this. */
const OTHER_ORDER_OFFSET = 10_000;

/**
 * A material's place in its bag tab: Character Development Items count from
 * #1, and so do the Materials-tab items (stored after them, from 10001).
 */
export function bagOrder(item: MaterialItem): { position: number; tab: string } {
  return item.order > OTHER_ORDER_OFFSET
    ? { position: item.order - OTHER_ORDER_OFFSET, tab: "Materials" }
    : { position: item.order, tab: "Character Development Items" };
}

/**
 * Returns human-friendly category title.
 */
export function getMaterialCategoryLabel(item: MaterialItem): string {
  const catId = getMaterialCategoryId(item);
  const found = MATERIAL_CATEGORIES.find((c) => c.id === catId);
  return found?.label || "Enhancement Material";
}

export const MATERIAL_THUMB_VERSION = `v${pkg.version}`;

/**
 * Small (128² WebP, ~4 KB) icon for lists, grids and pickers. The full 256²
 * `material.image` (~40 KB) is only worth loading for large single views.
 * Generated by `pnpm build:material-thumbs`.
 */
export function materialThumbUrl(id: string): string {
  return `/images/material-thumbs/${id}.webp?v=${MATERIAL_THUMB_VERSION}`;
}

/**
 * Styling helpers for rarities.
 * `accent` is an "r, g, b" triplet for the --glass-accent variable that tints
 * glass cards (src/styles/glass.css).
 */
export function getRarityStyles(rarity?: number) {
  switch (rarity) {
    case 5:
      return {
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        border:
          "border-amber-500/40 hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        cardBg: "from-amber-500/15 via-amber-950/20 to-black/40",
        pill: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        starColor: "text-amber-400",
        glow: "rgba(245, 158, 11, 0.25)",
        accent: "251, 191, 36",
      };
    case 4:
      return {
        badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        border:
          "border-purple-500/40 hover:border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        cardBg: "from-purple-500/15 via-purple-950/20 to-black/40",
        pill: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
        starColor: "text-purple-400",
        glow: "rgba(168, 85, 247, 0.25)",
        accent: "192, 132, 252",
      };
    case 3:
      return {
        badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        border:
          "border-blue-500/30 hover:border-blue-400/70 shadow-[0_0_12px_rgba(59,130,246,0.1)]",
        cardBg: "from-blue-500/15 via-blue-950/20 to-black/40",
        pill: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        starColor: "text-blue-400",
        glow: "rgba(59, 130, 246, 0.2)",
        accent: "96, 165, 250",
      };
    case 2:
      return {
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        border:
          "border-emerald-500/30 hover:border-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
        cardBg: "from-emerald-500/15 via-emerald-950/20 to-black/40",
        pill: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        starColor: "text-emerald-400",
        glow: "rgba(16, 185, 129, 0.2)",
        accent: "52, 211, 153",
      };
    case 1:
    default:
      return {
        badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        border: "border-slate-500/20 hover:border-slate-400/50",
        cardBg: "from-slate-500/10 via-slate-900/20 to-black/40",
        pill: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
        starColor: "text-slate-400",
        glow: "rgba(148, 163, 184, 0.15)",
        accent: "148, 163, 184",
      };
  }
}
