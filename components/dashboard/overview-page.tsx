import Link from "next/link";
import {
  ArrowRight,
  CookingPot,
  Gem,
  PackageSearch,
  Search,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";

import type { DashboardData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const modules = [
  {
    href: "/search",
    title: "Search",
    description: "Find characters, goals, materials, recipes, and enemies.",
    icon: Search,
  },
  {
    href: "/inventory",
    title: "Inventory",
    description: "Update owned material quantities across all goals.",
    icon: PackageSearch,
  },
  {
    href: "/goals",
    title: "Farming Goals",
    description: "Track farming targets and open goals for details.",
    icon: Target,
  },
  {
    href: "/materials",
    title: "Material Library",
    description: "Browse materials, crafting chains, and simulations.",
    icon: Gem,
  },
  {
    href: "/cooking",
    title: "Cooking",
    description: "Track recipe proficiency, ingredients, and auto cooking.",
    icon: CookingPot,
  },
  {
    href: "/enemies",
    title: "Enemies",
    description: "Browse enemy drops and farming targets tied to materials.",
    icon: ShieldAlert,
  },
  {
    href: "/characters",
    title: "Characters",
    description: "Review roster details and mark characters as owned.",
    icon: Users,
  },
] as const;

export function OverviewPage({
  data,
  username,
}: {
  data: DashboardData;
  username: string;
}) {
  const activeGoals = data.goals.filter((goal) => !goal.completed);
  const goalTotals = {
    active: activeGoals.length,
    completed: data.goals.length - activeGoals.length,
  };
  const requirementTotals = {
    covered: data.completedMaterials.reduce(
      (sum, material) => sum + material.required,
      0,
    ),
    remaining: data.materialsStillNeeded.reduce(
      (sum, material) => sum + material.remaining,
      0,
    ),
  };
  const neededMaterials = data.materialsStillNeeded
    .slice()
    .sort((left, right) => right.remaining - left.remaining)
    .slice(0, 6)
    .map((material) => ({
      label: material.materialName,
      value: material.remaining,
    }));
  const inventoryByCategory = Object.values(
    data.materials.reduce<Record<string, { label: string; value: number }>>(
      (groups, material) => {
        groups[material.category] ??= {
          label: material.category,
          value: 0,
        };
        groups[material.category].value += material.quantity;
        return groups;
      },
      {},
    ),
  )
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
  const goalProgress = activeGoals
    .slice()
    .sort((left, right) => right.progressPercent - left.progressPercent)
    .slice(0, 6)
    .map((goal) => ({
      label: goal.name,
      value: goal.progressPercent,
    }));
  const craftingPotential = data.materials
    .filter((material) => material.craftableExtra > 0)
    .sort((left, right) => right.craftableExtra - left.craftableExtra)
    .slice(0, 6)
    .map((material) => ({
      label: material.name,
      value: material.craftableExtra,
    }));

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          General Dashboard
        </h1>
        <p className="text-on-surface-variant mt-2">
          A central home for your Genshin tracker suite.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OverviewCard
          label="Tracked Materials"
          value={formatNumber(data.overview.totalTrackedMaterials)}
        />
        <OverviewCard
          label="Inventory Total"
          value={formatNumber(data.overview.totalInventory)}
        />
        <OverviewCard
          label="Active Goals"
          value={formatNumber(data.overview.activeGoals)}
        />
        <OverviewCard
          label="Completed Goals"
          value={formatNumber(data.overview.completedGoals)}
        />
        <OverviewCard
          label="Craftable"
          value={formatNumber(data.overview.craftableMaterials)}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <Card variant="outlined" className="p-6">
          <div className="mb-6">
            <h2 className="text-on-surface text-xl font-bold">Modules</h2>
            <p className="text-on-surface-variant text-sm">
              Open the tracker tools that are ready to use.
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
                    </div>
                    <h3 className="text-on-surface mt-6 text-lg font-bold">
                      {module.title}
                    </h3>
                    <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
                      {module.description}
                    </p>
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
          <SplitMetricChart
            title="Goal Completion"
            leftLabel="Active"
            leftValue={goalTotals.active}
            rightLabel="Completed"
            rightValue={goalTotals.completed}
          />
          <SplitMetricChart
            title="Requirement Coverage"
            leftLabel="Still needed"
            leftValue={requirementTotals.remaining}
            rightLabel="Covered"
            rightValue={requirementTotals.covered}
          />
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <BarChartPanel
          title="Top Needed Materials"
          emptyText="No active material shortages."
          items={neededMaterials}
        />
        <BarChartPanel
          title="Inventory by Category"
          emptyText="Add inventory quantities to see category weight."
          items={inventoryByCategory}
        />
        <BarChartPanel
          title="Active Goal Progress"
          emptyText="No active goals to chart."
          items={goalProgress}
          suffix="%"
          maxValue={100}
        />
        <BarChartPanel
          title="Crafting Potential"
          emptyText="No extra craftable materials right now."
          items={craftingPotential}
        />
      </section>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="filled" className="p-6">
      <p className="text-on-surface-variant text-sm font-medium">{label}</p>
      <p className="text-on-surface mt-2 text-3xl font-black">{value}</p>
    </Card>
  );
}

function SplitMetricChart({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  title: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const total = leftValue + rightValue;
  const leftPercent = total > 0 ? Math.round((leftValue / total) * 100) : 0;
  const rightPercent = total > 0 ? 100 - leftPercent : 0;

  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-on-surface text-xl font-bold">{title}</h2>
      <div className="mt-6 h-4 overflow-hidden rounded-full bg-surface-variant">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${leftPercent}%` }}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <MetricBlock
          label={leftLabel}
          value={leftValue}
          percent={leftPercent}
        />
        <MetricBlock
          label={rightLabel}
          value={rightValue}
          percent={rightPercent}
        />
      </div>
    </Card>
  );
}

function MetricBlock({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  return (
    <Card variant="filled" className="p-4">
      <p className="text-on-surface-variant text-sm font-medium">{label}</p>
      <p className="text-on-surface mt-2 text-2xl font-black">
        {formatNumber(value)}
      </p>
      <p className="text-on-surface-variant mt-1 text-xs font-bold">
        {percent}% of total
      </p>
    </Card>
  );
}

function BarChartPanel({
  title,
  items,
  emptyText,
  suffix = "",
  maxValue,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
  emptyText: string;
  suffix?: string;
  maxValue?: number;
}) {
  const highestValue = Math.max(
    maxValue ?? 0,
    ...items.map((item) => item.value),
  );

  return (
    <Card variant="outlined" className="p-6">
      <h2 className="text-on-surface text-xl font-bold">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <Card
            variant="filled"
            className="text-on-surface-variant px-4 py-4 text-sm font-medium"
          >
            {emptyText}
          </Card>
        ) : (
          items.map((item) => {
            const width =
              highestValue > 0
                ? Math.max(6, Math.round((item.value / highestValue) * 100))
                : 0;

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-on-surface truncate text-sm font-bold">
                    {item.label}
                  </p>
                  <p className="text-on-surface-variant shrink-0 text-sm font-bold">
                    {formatNumber(item.value)}
                    {suffix}
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-variant">
                  <div
                    className="h-full rounded-full bg-secondary"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
