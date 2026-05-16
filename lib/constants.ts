export const rarityColorMap: Record<number, string> = {
  1: "from-slate-400 to-slate-500",
  2: "from-emerald-400 to-emerald-600",
  3: "from-sky-400 to-sky-600",
  4: "from-violet-400 to-violet-600",
  5: "from-amber-300 to-amber-500",
};

export const rarityBorderMap: Record<number, string> = {
  1: "border-slate-300/60 dark:border-slate-600/60",
  2: "border-emerald-300/60 dark:border-emerald-700/60",
  3: "border-sky-300/60 dark:border-sky-700/60",
  4: "border-violet-300/60 dark:border-violet-700/60",
  5: "border-amber-300/60 dark:border-amber-700/60",
};

export const tabs = ["inventory", "goals", "materials", "crafting"] as const;

export type DashboardTab = (typeof tabs)[number];
