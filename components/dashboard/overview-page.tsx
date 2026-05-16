import Link from "next/link";
import { ArrowRight, Compass, Gem, Shield, Sparkles, Swords } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { DashboardData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const modules = [
  {
    href: "/materials",
    title: "Material Tracker",
    description: "Inventory, goals, recursive crafting, and farming progress.",
    icon: Gem,
    status: "Active"
  },
  {
    href: "/map",
    title: "Map",
    description: "Future world map for routes, pins, and region-specific planning.",
    icon: Compass,
    status: "Planned"
  },
  {
    href: "/collectibles",
    title: "Collectibles",
    description: "Hydroculus, Dendroculus, Lumenspar, and similar world pickups.",
    icon: Sparkles,
    status: "Planned"
  },
  {
    href: "/shrines",
    title: "Shrines",
    description: "Track shrine locations, status, and future lock/unlock progress.",
    icon: Shield,
    status: "Planned"
  },
  {
    href: "/challenges",
    title: "Challenges",
    description: "General and one-off challenge systems with completion tracking.",
    icon: Swords,
    status: "Planned"
  }
] as const;

export function OverviewPage({ data, username }: { data: DashboardData; username: string }) {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">General Dashboard</h1>
        <p className="mt-2 text-on-surface-variant">A central home for your Genshin tracker suite.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OverviewCard label="Tracked Materials" value={formatNumber(data.overview.totalTrackedMaterials)} />
        <OverviewCard label="Inventory Total" value={formatNumber(data.overview.totalInventory)} />
        <OverviewCard label="Active Goals" value={formatNumber(data.overview.activeGoals)} />
        <OverviewCard label="Completed Goals" value={formatNumber(data.overview.completedGoals)} />
        <OverviewCard label="Craftable" value={formatNumber(data.overview.craftableMaterials)} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
        <Card variant="outlined" className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-on-surface">Modules</h2>
            <p className="text-sm text-on-surface-variant">
              Explore different feature areas of the tracker suite.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link key={module.href} href={module.href} className="group">
                  <Card
                    variant="filled"
                    className="h-full p-6 transition-transform group-hover:scale-[1.02] group-hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-secondary-on-container">
                        {module.status}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-on-surface">{module.title}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{module.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
                      Open module
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="space-y-8">
          <SummaryPanel
            title="Current Material Status"
            items={[
              `${formatNumber(data.materialsStillNeeded.length)} material requirements still need farming`,
              `${formatNumber(data.completedMaterials.length)} requirement entries are already covered`,
              `${formatNumber(data.overview.craftableMaterials)} materials can be increased via crafting right now`
            ]}
          />
          <SummaryPanel
            title="Architecture Direction"
            items={[
              "Dashboard stays product-wide and lightweight",
              "Material tracking lives on its own isolated page",
              "Future modules can be added without restructuring the suite"
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="filled" className="p-6">
      <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      <p className="mt-2 text-3xl font-black text-on-surface">{value}</p>
    </Card>
  );
}

function SummaryPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-xl font-bold text-on-surface">{title}</h2>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <Card key={item} variant="filled" className="px-4 py-4 text-sm font-medium text-on-surface-variant">
            {item}
          </Card>
        ))}
      </div>
    </Card>
  );
}
