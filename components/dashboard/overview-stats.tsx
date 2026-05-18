"use client";

import type { LucideIcon } from "lucide-react";
import { PackageSearch, Sparkles, Target } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { OverviewStats } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const overviewMeta: Array<{
  key: keyof OverviewStats;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "totalTrackedMaterials", label: "Tracked Materials", icon: Target },
  { key: "totalInventory", label: "Inventory Total", icon: PackageSearch },
  { key: "activeGoals", label: "Active Goals", icon: Target },
  { key: "completedGoals", label: "Completed Goals", icon: Sparkles },
  { key: "craftableMaterials", label: "Craftable", icon: Sparkles },
];

export function OverviewStatsGrid({ overview }: { overview: OverviewStats }) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      aria-label="Dashboard overview"
    >
      {overviewMeta.map((item) => (
        <Card key={item.key} variant="filled" className="p-5">
          <div className="text-on-surface-variant flex items-center gap-3">
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <p className="text-on-surface mt-2 text-3xl font-bold">
            {formatNumber(overview[item.key])}
          </p>
        </Card>
      ))}
    </section>
  );
}
