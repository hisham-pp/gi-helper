"use client";

import Image from "next/image";
import type { ChangeEvent, PropsWithChildren, ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { MoonStar, PackageSearch, Save, Sparkles, SunMedium, Target, Trash2, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  createGoalAction,
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
  saveInventoryAction
} from "@/app/actions";
import { rarityBorderMap, rarityColorMap, tabs, type DashboardTab } from "@/lib/constants";
import { simulateCraftingNeed } from "@/lib/crafting";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

type DashboardShellProps = {
  initialData: DashboardData;
};

type InventoryDraft = Record<string, number>;

const overviewMeta = [
  { key: "totalTrackedMaterials", label: "Tracked Materials" },
  { key: "totalInventory", label: "Inventory Total" },
  { key: "activeGoals", label: "Active Goals" },
  { key: "completedGoals", label: "Completed Goals" },
  { key: "craftableMaterials", label: "Craftable" }
] as const;

export function DashboardShell({ initialData }: DashboardShellProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<DashboardTab>("inventory");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>(
    Object.fromEntries(initialData.materials.map((material) => [material.id, material.quantity]))
  );
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState(initialData.goals[0]?.id ?? "");
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialData.materials[0]?.id ?? "");
  const [goalMaterialRequired, setGoalMaterialRequired] = useState(1);
  const [simulationMaterialId, setSimulationMaterialId] = useState(initialData.materials[0]?.id ?? "");
  const [simulationRequired, setSimulationRequired] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme, setTheme } = useTheme();

  const categories = useMemo(
    () => ["All", ...new Set(data.materials.map((material) => material.category))],
    [data.materials]
  );

  const filteredMaterials = useMemo(() => {
    return data.materials.filter((material) => {
      const matchesSearch =
        material.name.toLowerCase().includes(search.toLowerCase()) ||
        material.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || material.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, data.materials, search]);

  const simulation = useMemo(() => {
    if (!simulationMaterialId) {
      return null;
    }

    return simulateCraftingNeed(
      simulationMaterialId,
      Math.max(simulationRequired, 0),
      data.materials.map((material) => ({
        id: material.id,
        name: material.name,
        image: material.image,
        rarity: material.rarity,
        category: material.category,
        description: material.description,
        combinable: material.combinable,
        combineRatio: material.combineRatio,
        parentMaterialId: material.parentMaterialId,
        quantity: material.quantity
      }))
    );
  }, [data.materials, simulationMaterialId, simulationRequired]);

  function syncDashboard(nextData: DashboardData) {
    setData(nextData);
    setInventoryDraft(Object.fromEntries(nextData.materials.map((material) => [material.id, material.quantity])));
    setSelectedGoalId((current) =>
      nextData.goals.some((goal) => goal.id === current) ? current : (nextData.goals[0]?.id ?? "")
    );
    setSelectedMaterialId((current) =>
      nextData.materials.some((material) => material.id === current)
        ? current
        : (nextData.materials[0]?.id ?? "")
    );
    setSimulationMaterialId((current) =>
      nextData.materials.some((material) => material.id === current)
        ? current
        : (nextData.materials[0]?.id ?? "")
    );
  }

  function handleInventorySave(materialId: string) {
    const nextQuantity = Math.max(0, Number(inventoryDraft[materialId] ?? 0));
    const previous = data;

    const optimistic: DashboardData = {
      ...data,
      materials: data.materials.map((material) =>
        material.id === materialId ? { ...material, quantity: nextQuantity } : material
      )
    } as DashboardData;

    syncDashboard(optimistic);

    startTransition(async () => {
      const result = await saveInventoryAction({ materialId, quantity: nextQuantity });

      if (!result.success || !result.data) {
        syncDashboard(previous);
        toast.error(result.error ?? "Unable to save inventory.");
        return;
      }

      syncDashboard(result.data);
      toast.success("Inventory updated.");
    });
  }

  function handleCreateGoal() {
    if (!goalName.trim()) {
      toast.error("Goal name is required.");
      return;
    }

    startTransition(async () => {
      const result = await createGoalAction({
        name: goalName,
        description: goalDescription
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to create goal.");
        return;
      }

      syncDashboard(result.data);
      setGoalName("");
      setGoalDescription("");
      setSelectedGoalId(result.data.goals[0]?.id ?? "");
      toast.success("Goal created.");
    });
  }

  function handleSaveGoalMaterial() {
    if (!selectedGoalId || !selectedMaterialId) {
      toast.error("Select a goal and material.");
      return;
    }

    startTransition(async () => {
      const result = await saveGoalMaterialAction({
        goalId: selectedGoalId,
        materialId: selectedMaterialId,
        required: goalMaterialRequired
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to save goal material.");
        return;
      }

      syncDashboard(result.data);
      toast.success("Goal material saved.");
    });
  }

  function handleDeleteGoal(goalId: string) {
    startTransition(async () => {
      const result = await deleteGoalAction({ goalId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to delete goal.");
        return;
      }

      syncDashboard(result.data);
      toast.success("Goal deleted.");
    });
  }

  function handleDeleteGoalMaterial(goalMaterialId: string) {
    startTransition(async () => {
      const result = await deleteGoalMaterialAction({ goalMaterialId });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to remove requirement.");
        return;
      }

      syncDashboard(result.data);
      toast.success("Requirement removed.");
    });
  }

  async function handleExportInventory() {
    const response = await fetch("/api/inventory/export");
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "genshin-material-tracker-inventory.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Inventory exported.");
  }

  async function handleImportInventory(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();

    try {
      const parsed = JSON.parse(text);
      const response = await fetch("/api/inventory/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed)
      });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      window.location.reload();
    } catch {
      toast.error("Unable to import inventory JSON.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[32px] border border-white/40 bg-hero-grid bg-card/80 p-6 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Genshin Material Tracker
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Plan materials, monitor inventory, and simulate crafting from one dashboard.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Seeded with common Genshin materials, recursive 3:1 crafting logic, inventory tracking, and
                farming goals built for desktop and mobile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                type="button"
              >
                {resolvedTheme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
                onClick={handleExportInventory}
                type="button"
              >
                <Save className="h-4 w-4" />
                Export JSON
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                <Upload className="h-4 w-4" />
                Import JSON
                <input className="hidden" onChange={handleImportInventory} type="file" accept="application/json" />
              </label>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {overviewMeta.map((item) => (
            <article
              key={item.key}
              className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                {formatNumber(data.overview[item.key])}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur dark:bg-slate-950/80">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-medium capitalize transition",
                  activeTab === tab
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "inventory" ? (
          <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Inventory</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Search, filter, and update owned quantities with optimistic saves.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="rounded-2xl border border-border bg-white/70 px-4 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 dark:bg-white/5"
                    placeholder="Search materials"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    className="rounded-2xl border border-border bg-white/70 px-4 py-2 text-sm outline-none dark:bg-white/5"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMaterials.length === 0 ? (
                  <EmptyState
                    icon={<PackageSearch className="h-6 w-6" />}
                    title="No materials found"
                    description="Adjust the search or category filter to find seeded materials."
                  />
                ) : (
                  filteredMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      quantity={inventoryDraft[material.id] ?? material.quantity}
                      onChange={(value) =>
                        setInventoryDraft((current) => ({
                          ...current,
                          [material.id]: Math.max(0, Number.isNaN(value) ? 0 : value)
                        }))
                      }
                      onSave={() => handleInventorySave(material.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <SummaryList
                items={data.materialsStillNeeded.slice(0, 8).map((item) => ({
                  id: item.id,
                  title: item.materialName,
                  subtitle: `${formatNumber(item.remaining)} still needed`,
                  image: item.materialId
                }))}
                title="Materials Still Needed"
                description="Highest deficits across all farming goals."
                emptyText="No shortages. All tracked goals are currently covered."
              />
              <SummaryList
                items={data.completedMaterials.slice(0, 8).map((item) => ({
                  id: item.id,
                  title: item.materialName,
                  subtitle: `${formatNumber(item.required)} ready`,
                  image: item.materialId
                }))}
                title="Completed Materials"
                description="Goal requirements already satisfied by current inventory and crafting."
                emptyText="Completed requirements will appear here."
              />
            </div>
          </section>
        ) : null}

        {activeTab === "goals" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
            <div className="space-y-6">
              <Panel title="Create Goal" description="Set up a new farming target.">
                <div className="space-y-3">
                  <input
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                    placeholder="Goal name"
                    value={goalName}
                    onChange={(event) => setGoalName(event.target.value)}
                  />
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                    placeholder="Optional note"
                    value={goalDescription}
                    onChange={(event) => setGoalDescription(event.target.value)}
                  />
                  <button
                    className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    type="button"
                    onClick={handleCreateGoal}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Create Goal"}
                  </button>
                </div>
              </Panel>

              <Panel title="Add Requirement" description="Attach materials and required quantities to a goal.">
                <div className="space-y-3">
                  <select
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                    value={selectedGoalId}
                    onChange={(event) => setSelectedGoalId(event.target.value)}
                  >
                    {data.goals.length === 0 ? (
                      <option value="">Create a goal first</option>
                    ) : (
                      data.goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))
                    )}
                  </select>
                  <select
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                    value={selectedMaterialId}
                    onChange={(event) => setSelectedMaterialId(event.target.value)}
                  >
                    {data.materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                    type="number"
                    min={0}
                    value={goalMaterialRequired}
                    onChange={(event) => setGoalMaterialRequired(Number(event.target.value))}
                  />
                  <button
                    className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-60"
                    type="button"
                    onClick={handleSaveGoalMaterial}
                    disabled={isPending || data.goals.length === 0}
                  >
                    {isPending ? "Saving..." : "Save Requirement"}
                  </button>
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              {data.goals.length === 0 ? (
                <Panel title="No Goals Yet" description="Create a goal to start tracking farming progress.">
                  <EmptyState
                    icon={<Target className="h-6 w-6" />}
                    title="Your planner is empty"
                    description="Add a goal and assign materials to see progress bars, shortages, and craftable coverage."
                  />
                </Panel>
              ) : (
                data.goals.map((goal) => <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onDeleteMaterial={handleDeleteGoalMaterial} />)
              )}
            </div>
          </section>
        ) : null}

        {activeTab === "materials" ? (
          <Panel title="Material Library" description="Preloaded material data with rarity colors and crafting links.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.materials.map((material) => (
                <article
                  key={material.id}
                  className={cn(
                    "rounded-3xl border bg-white/60 p-4 dark:bg-white/5",
                    rarityBorderMap[material.rarity] ?? rarityBorderMap[1]
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "relative h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br",
                        rarityColorMap[material.rarity] ?? rarityColorMap[1]
                      )}
                    >
                      <Image
                        src={`/api/material-image/${material.id}`}
                        alt={material.name}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-950 dark:text-white">{material.name}</h3>
                        <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {material.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{material.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                        <span className="rounded-full border border-border px-2.5 py-1">Rarity {material.rarity}</span>
                        <span className="rounded-full border border-border px-2.5 py-1">
                          Owned {formatNumber(material.quantity)}
                        </span>
                        {material.combinable && material.parentMaterialId ? (
                          <span className="rounded-full border border-border px-2.5 py-1">
                            3:1 to {data.materials.find((item) => item.id === material.parentMaterialId)?.name}
                          </span>
                        ) : (
                          <span className="rounded-full border border-border px-2.5 py-1">Highest tier</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeTab === "crafting" ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
            <Panel title="Crafting Simulator" description="Test whether current inventory can recursively satisfy a target amount.">
              <div className="space-y-3">
                <select
                  className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                  value={simulationMaterialId}
                  onChange={(event) => setSimulationMaterialId(event.target.value)}
                >
                  {data.materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
                  type="number"
                  min={0}
                  value={simulationRequired}
                  onChange={(event) => setSimulationRequired(Number(event.target.value))}
                />
              </div>
            </Panel>

            <Panel title="Simulation Result" description="Craftability, remaining deficit, surplus, and recursive source materials.">
              {!simulation ? (
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="Choose a material"
                  description="Select a material and required amount to preview recursive crafting."
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatPill label="Requested" value={formatNumber(simulation.requested)} />
                    <StatPill label="Total Available" value={formatNumber(simulation.totalAvailable)} />
                    <StatPill label="Deficit" value={formatNumber(simulation.remaining)} tone={simulation.remaining > 0 ? "danger" : "success"} />
                    <StatPill label="Surplus" value={formatNumber(simulation.surplus)} tone={simulation.surplus > 0 ? "success" : "default"} />
                  </div>
                  <div className="rounded-3xl border border-border bg-white/50 p-4 dark:bg-white/5">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {simulation.craftable
                        ? `You can fully craft ${simulation.requested} ${data.materials.find((item) => item.id === simulation.materialId)?.name} from current inventory.`
                        : `You are short by ${simulation.remaining} after using direct inventory and recursive 3:1 crafting.`}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Directly owned: {formatNumber(simulation.directOwned)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-white/50 p-4 dark:bg-white/5">
                    <h3 className="font-medium text-slate-950 dark:text-white">Recursive sources</h3>
                    <div className="mt-3 space-y-2">
                      {simulation.recursiveSources.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No lower-tier materials are currently available for this chain.
                        </p>
                      ) : (
                        simulation.recursiveSources.map((source) => (
                          <div key={source.materialId} className="flex items-center justify-between rounded-2xl border border-border px-3 py-2 text-sm">
                            <span>{source.materialName}</span>
                            <span className="text-slate-500 dark:text-slate-400">{formatNumber(source.quantity)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function MaterialCard({
  material,
  quantity,
  onChange,
  onSave
}: {
  material: MaterialView;
  quantity: number;
  onChange: (value: number) => void;
  onSave: () => void;
}) {
  return (
    <article
      className={cn(
        "rounded-3xl border bg-white/60 p-4 shadow-sm transition hover:-translate-y-0.5 dark:bg-white/5",
        rarityBorderMap[material.rarity] ?? rarityBorderMap[1]
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1]
          )}
        >
          <Image
            src={`/api/material-image/${material.id}`}
            alt={material.name}
            fill
            className="object-contain p-2"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-950 dark:text-white">{material.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{material.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span className="rounded-full border border-border px-2.5 py-1">{material.category}</span>
            <span className="rounded-full border border-border px-2.5 py-1">
              Total craftable {formatNumber(material.totalCraftable)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm outline-none dark:bg-white/5"
        />
        <button
          type="button"
          onClick={onSave}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950"
        >
          Save
        </button>
      </div>
    </article>
  );
}

function GoalCard({
  goal,
  onDelete,
  onDeleteMaterial
}: {
  goal: GoalView;
  onDelete: (goalId: string) => void;
  onDeleteMaterial: (goalMaterialId: string) => void;
}) {
  return (
    <Panel title={goal.name} description={goal.description ?? "Custom farming plan."} action={
      <button
        className="inline-flex items-center gap-2 rounded-full border border-rose-300/70 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
        onClick={() => onDelete(goal.id)}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    }>
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Progress</span>
            <span className="font-medium text-slate-950 dark:text-white">{goal.progressPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all"
              style={{ width: `${goal.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {goal.materials.length === 0 ? (
            <EmptyState
              icon={<Target className="h-5 w-5" />}
              title="No requirements"
              description="Attach materials to this goal from the add requirement panel."
            />
          ) : (
            goal.materials.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-white/50 p-3 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br",
                        rarityColorMap[item.rarity] ?? rarityColorMap[1]
                      )}
                    >
                      <Image
                        src={`/api/material-image/${item.materialId}`}
                        alt={item.materialName}
                        fill
                        className="object-contain p-2"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-950 dark:text-white">{item.materialName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatNumber(item.allocated)} / {formatNumber(item.required)} allocated
                      </p>
                    </div>
                  </div>
                  <button
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-white/5"
                    type="button"
                    onClick={() => onDeleteMaterial(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      item.complete ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-sky-500"
                    )}
                    style={{ width: `${Math.min((item.allocated / Math.max(item.required, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}

function SummaryList({
  title,
  description,
  items,
  emptyText
}: {
  title: string;
  description: string;
  items: Array<{ id: string; title: string; subtitle: string; image: string }>;
  emptyText: string;
}) {
  return (
    <Panel title={title} description={description}>
      {items.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-5 w-5" />} title={title} description={emptyText} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white/50 p-3 dark:bg-white/5">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900">
                <Image src={`/api/material-image/${item.image}`} alt={item.title} fill className="object-contain p-2" sizes="48px" />
              </div>
              <div>
                <p className="font-medium text-slate-950 dark:text-white">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Panel({
  title,
  description,
  children,
  action
}: PropsWithChildren<{
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/80">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white/50 p-6 text-center dark:bg-white/5">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-white/10 dark:text-slate-300">{icon}</div>
      <h3 className="font-medium text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const tones = {
    default: "border-border bg-white/50 dark:bg-white/5",
    success: "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    danger: "border-rose-300/60 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
  } as const;

  return (
    <div className={cn("rounded-3xl border p-4", tones[tone])}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
