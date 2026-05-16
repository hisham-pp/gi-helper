import Link from "next/link";
import { ArrowRight, Compass, Gem, Shield, Sparkles, Swords } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { DashboardData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

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
    description: "General and one-off challenge systems with future completion tracking.",
    icon: Swords,
    status: "Planned"
  }
] as const;

export function OverviewPage({ data, username }: { data: DashboardData; username: string }) {
  return (
    <AppShell
      title="General Dashboard"
      description="A central home for your future Genshin tracker suite, with the material system isolated as one module."
      userLabel={username}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OverviewCard label="Tracked Materials" value={formatNumber(data.overview.totalTrackedMaterials)} />
        <OverviewCard label="Inventory Total" value={formatNumber(data.overview.totalInventory)} />
        <OverviewCard label="Active Goals" value={formatNumber(data.overview.activeGoals)} />
        <OverviewCard label="Completed Goals" value={formatNumber(data.overview.completedGoals)} />
        <OverviewCard label="Craftable Materials" value={formatNumber(data.overview.craftableMaterials)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Modules</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Feature areas are split into routes so new systems can be added cleanly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group rounded-3xl border border-border bg-white/50 p-5 transition hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-slate-500 dark:text-slate-300">
                      {module.status}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{module.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-300">
                    Open module
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
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
              "Material tracking lives on its own page and component tree",
              "Map, collectibles, shrines, and challenges can be added without restructuring the material module"
            ]}
          />
        </div>
      </section>
    </AppShell>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </article>
  );
}

function SummaryPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80">
      <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-white/50 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
