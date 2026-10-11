import materialsData from "@/data/materials.json";
import { MaterialItem } from "./types";

export type MaterialCategory =
  | "ALL"
  | "EXP"
  | "REFINEMENT"
  | "ENHANCEMENT"
  | "BOSS"
  | "GEM"
  | "TALENT"
  | "WEAPON";

export interface CategoryMeta {
  id: MaterialCategory;
  label: string;
  shortLabel: string;
  description: string;
  sortRankRange: string;
}

export const MATERIAL_CATEGORIES: CategoryMeta[] = [
  {
    id: "ALL",
    label: "All Materials",
    shortLabel: "All",
    description: "Every material available in the game",
    sortRankRange: "1 - 15124",
  },
  {
    id: "EXP",
    label: "Character & Weapon EXP",
    shortLabel: "EXP Materials",
    description: "Hero's Wit, Adventurer's Experience, and Enhancement Ores",
    sortRankRange: "5 - 100",
  },
  {
    id: "REFINEMENT",
    label: "Refinement Material",
    shortLabel: "Refinement",
    description: "Specialized event weapon refinement items",
    sortRankRange: "90",
  },
  {
    id: "ENHANCEMENT",
    label: "Character & Weapon Enhancement",
    shortLabel: "Common / Mob",
    description: "Enemy drops and common enhancement materials",
    sortRankRange: "10105 - 10640",
  },
  {
    id: "BOSS",
    label: "Boss & Level-Up Material",
    shortLabel: "Boss Drops",
    description: "Normal boss and weekly trounce domain materials",
    sortRankRange: "11101",
  },
  {
    id: "GEM",
    label: "Character Ascension Gem",
    shortLabel: "Gems",
    description: "Elemental slivers, fragments, chunks, and gemstones",
    sortRankRange: "12101 - 12108",
  },
  {
    id: "TALENT",
    label: "Character Talent Material",
    shortLabel: "Talent Books",
    description: "Teachings, guides, philosophies, and crowns",
    sortRankRange: "13101 - 14101",
  },
  {
    id: "WEAPON",
    label: "Weapon Ascension Material",
    shortLabel: "Weapon Mats",
    description: "Domain-forged weapon ascension materials",
    sortRankRange: "15101 - 15124",
  },
];

/**
 * Returns the category ID of a material based on its sortRank and in-game semantics.
 */
export function getMaterialCategoryId(item: MaterialItem): MaterialCategory {
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

/**
 * Returns human-friendly category title.
 */
export function getMaterialCategoryLabel(item: MaterialItem): string {
  const catId = getMaterialCategoryId(item);
  const found = MATERIAL_CATEGORIES.find((c) => c.id === catId);
  return found?.label || "Enhancement Material";
}

/**
 * Returns all materials guaranteed sorted by canonical application order.
 */
export function getAllMaterials(): MaterialItem[] {
  return (materialsData as MaterialItem[])
    .slice()
    .sort((a, b) => a.order - b.order);
}

/**
 * Styling helpers for rarities
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
      };
  }
}
