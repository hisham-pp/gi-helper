"use client";

import Image from "next/image";
import type { PropsWithChildren, ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { PackageSearch, Sparkles, Target, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  createGoalAction,
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
  saveInventoryAction
} from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import { rarityBorderMap, rarityColorMap, tabs, type DashboardTab } from "@/lib/constants";
import { simulateCraftingNeed } from "@/lib/crafting";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

type DashboardShellProps = {
  initialData: DashboardData;
  username: string;
};

type InventoryDraft = Record<string, number>;

const overviewMeta = [
  { key: "totalTrackedMaterials", label: "Tracked Materials", icon: Target },
  { key: "totalInventory", label: "Inventory Total", icon: PackageSearch },
  { key: "activeGoals", label: "Active Goals", icon: Target },
  { key: "completedGoals", label: "Completed Goals", icon: Sparkles },
  { key: "craftableMaterials", label: "Craftable", icon: Sparkles }
] as const;

export function DashboardShell({ initialData, username }: DashboardShellProps) {
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

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Material Tracker</h1>
        <p className="mt-2 text-on-surface-variant">Track inventory, goals, material chains, and recursive 3:1 crafting.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {overviewMeta.map((item) => (
          <Card key={item.key} variant="filled" className="p-5">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-on-surface">
              {formatNumber(data.overview[item.key])}
            </p>
          </Card>
        ))}
      </section>

      <nav className="flex items-center justify-center">
        <div className="flex gap-2 rounded-full bg-surface-variant/50 p-1">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "filled" : "text"}
              onClick={() => setActiveTab(tab)}
              className="h-10 px-6 capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </nav>

      {activeTab === "inventory" ? (
        <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <Card className="flex flex-col overflow-hidden" variant="outlined">
            <div className="border-b border-outline-variant bg-surface p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Inventory</h2>
                  <p className="text-sm text-on-surface-variant">
                    Search, filter, and update owned quantities.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    label="Search"
                    className="h-12"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Select
                    label="Category"
                    className="h-12"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categories.map((category) => ({ label: category, value: category }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredMaterials.length === 0 ? (
                  <div className="col-span-full py-12">
                    <EmptyState
                      icon={<PackageSearch className="h-10 w-10" />}
                      title="No materials found"
                      description="Adjust the search or category filter to find materials."
                    />
                  </div>
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
          </Card>

          <div className="space-y-8">
            <SummaryList
              items={data.materialsStillNeeded.slice(0, 8).map((item) => ({
                id: item.id,
                title: item.materialName,
                subtitle: `${formatNumber(item.remaining)} still needed`,
                image: item.materialId
              }))}
              title="Materials Still Needed"
              description="Highest deficits across all farming goals."
              emptyText="No shortages. All goals are covered."
            />
            <SummaryList
              items={data.completedMaterials.slice(0, 8).map((item) => ({
                id: item.id,
                title: item.materialName,
                subtitle: `${formatNumber(item.required)} ready`,
                image: item.materialId
              }))}
              title="Completed Materials"
              description="Goal requirements satisfied by current inventory."
              emptyText="Completed requirements will appear here."
            />
          </div>
        </section>
      ) : null}

      {activeTab === "goals" ? (
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.4fr]">
          <div className="space-y-8">
            <Panel title="Create Goal" description="Set up a new farming target.">
              <div className="mt-6 space-y-6">
                <TextField
                  label="Goal name"
                  variant="outlined"
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                  helperText="Give your farming goal a memorable name"
                />
                <Textarea
                  label="Description (optional)"
                  value={goalDescription}
                  onChange={(event) => setGoalDescription(event.target.value)}
                  rows={3}
                />
                <Button
                  className="w-full"
                  onClick={handleCreateGoal}
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </Panel>

            <Panel title="Add Requirement" description="Attach materials to a goal.">
              <div className="mt-6 space-y-6">
                <Select
                  label="Select Goal"
                  value={selectedGoalId}
                  onChange={setSelectedGoalId}
                  options={
                    data.goals.length === 0
                      ? [{ label: "Create a goal first", value: "" }]
                      : data.goals.map((goal) => ({ label: goal.name, value: goal.id }))
                  }
                />
                <Select
                  label="Select Material"
                  value={selectedMaterialId}
                  onChange={setSelectedMaterialId}
                  options={data.materials.map((material) => ({ label: material.name, value: material.id }))}
                />
                <TextField
                  label="Required Quantity"
                  variant="outlined"
                  type="number"
                  min={0}
                  value={goalMaterialRequired}
                  onChange={(event) => setGoalMaterialRequired(Number(event.target.value))}
                  helperText="How many of this material do you need?"
                />
                <Button
                  className="w-full"
                  variant="tonal"
                  onClick={handleSaveGoalMaterial}
                  disabled={isPending || data.goals.length === 0}
                >
                  {isPending ? "Adding..." : "Add Requirement"}
                </Button>
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            {data.goals.length === 0 ? (
              <Card variant="outlined" className="p-8">
                <EmptyState
                  icon={<Target className="h-12 w-12" />}
                  title="No Goals Yet"
                  description="Create a goal and assign materials to start tracking."
                />
              </Card>
            ) : (
              data.goals.map((goal) => <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onDeleteMaterial={handleDeleteGoalMaterial} />)
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "materials" ? (
        <Panel title="Material Library" description="Preloaded data with rarity colors and crafting links.">
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.materials.map((material) => (
              <Card
                key={material.id}
                variant="outlined"
                className={cn(
                  "p-5 transition-transform hover:scale-[1.02]",
                  rarityBorderMap[material.rarity] ?? rarityBorderMap[1]
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br",
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
                      <h3 className="font-bold text-on-surface">{material.name}</h3>
                      <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-secondary-on-container">
                        {material.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">{material.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-outline-variant px-2.5 py-1 font-medium text-on-surface-variant">Rarity {material.rarity}</span>
                      <span className="rounded-full border border-outline-variant px-2.5 py-1 font-medium text-on-surface-variant">
                        Owned {formatNumber(material.quantity)}
                      </span>
                      {material.combinable && material.parentMaterialId ? (
                        <span className="rounded-full border border-outline-variant px-2.5 py-1 font-medium text-on-surface-variant">
                          3:1 Crafting
                        </span>
                      ) : (
                        <span className="rounded-full border border-outline-variant px-2.5 py-1 font-medium text-on-surface-variant">Highest tier</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Panel>
      ) : null}

      {activeTab === "crafting" ? (
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr]">
          <Panel title="Crafting Simulator" description="Recursive 3:1 crafting preview.">
            <div className="mt-4 space-y-4">
              <Select
                label="Select Material"
                value={simulationMaterialId}
                onChange={setSimulationMaterialId}
                options={data.materials.map((material) => ({ label: material.name, value: material.id }))}
              />
              <Input
                label="Required Quantity"
                type="number"
                min={0}
                value={simulationRequired}
                onChange={(event) => setSimulationRequired(Number(event.target.value))}
              />
            </div>
          </Panel>

          <Panel title="Simulation Result" description="Craftability and recursive breakdown.">
            {!simulation ? (
              <div className="py-12">
                <EmptyState
                  icon={<Sparkles className="h-10 w-10" />}
                  title="Choose a material"
                  description="Select a material to preview recursive crafting."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatPill label="Requested" value={formatNumber(simulation.requested)} />
                  <StatPill label="Total Available" value={formatNumber(simulation.totalAvailable)} />
                  <StatPill label="Deficit" value={formatNumber(simulation.remaining)} tone={simulation.remaining > 0 ? "danger" : "success"} />
                  <StatPill label="Surplus" value={formatNumber(simulation.surplus)} tone={simulation.surplus > 0 ? "success" : "default"} />
                </div>
                <Card variant="filled" className="p-5">
                  <p className="text-sm font-medium text-on-surface">
                    {simulation.craftable
                      ? `You can fully craft ${simulation.requested} ${data.materials.find((item) => item.id === simulation.materialId)?.name}.`
                      : `You are short by ${simulation.remaining} after recursive crafting.`}
                  </p>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Directly owned: {formatNumber(simulation.directOwned)}
                  </p>
                </Card>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Recursive sources</h3>
                  <div className="grid gap-2">
                    {simulation.recursiveSources.length === 0 ? (
                      <p className="text-sm text-on-surface-variant italic">
                        No lower-tier materials needed.
                      </p>
                    ) : (
                      simulation.recursiveSources.map((source) => (
                        <div key={source.materialId} className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-3 text-sm">
                          <span className="font-medium">{source.materialName}</span>
                          <span className="font-bold text-primary">{formatNumber(source.quantity)}</span>
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
    </div>
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
    <Card
      variant="outlined"
      className={cn(
        "p-4 transition-all hover:shadow-md",
        rarityBorderMap[material.rarity] ?? rarityBorderMap[1]
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1]
          )}
        >
          <Image
            src={`/api/material-image/${material.id}`}
            alt={material.name}
            fill
            className="object-contain p-2"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-on-surface truncate">{material.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-full bg-surface-variant px-2 py-0.5 font-medium text-on-surface-variant">{material.category}</span>
            <span className="rounded-full bg-primary-container px-2 py-0.5 font-medium text-on-primary-container">
              Craftable {formatNumber(material.totalCraftable)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={0}
            className="h-11"
            value={quantity}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </div>
        <Button
          variant="filled"
          className="h-11 px-4"
          onClick={onSave}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </Card>
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
      <Button
        variant="text"
        className="text-error hover:bg-error/5"
        onClick={() => onDelete(goal.id)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Goal
      </Button>
    }>
      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-on-surface-variant">Overall Progress</span>
            <span className="font-bold text-primary">{goal.progressPercent}%</span>
          </div>
          <Progress value={goal.progressPercent} className="h-2" />
        </div>

        <div className="space-y-3">
          {goal.materials.length === 0 ? (
            <EmptyState
              icon={<Target className="h-6 w-6" />}
              title="No requirements"
              description="Add materials to this goal to track progress."
            />
          ) : (
            goal.materials.map((item) => (
              <Card key={item.id} variant="filled" className="p-4 bg-surface-variant/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={cn(
                        "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
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
                      <p className="font-bold text-on-surface">{item.materialName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {formatNumber(item.allocated)} / {formatNumber(item.required)} allocated
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="text"
                    className="h-8 w-8 p-0 text-on-surface-variant hover:text-error hover:bg-error/5"
                    onClick={() => onDeleteMaterial(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <Progress
                    value={(item.allocated / Math.max(item.required, 1)) * 100}
                    className={cn("h-1.5")}
                  />
                </div>
              </Card>
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
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <EmptyState icon={<Sparkles className="h-6 w-6" />} title={title} description={emptyText} />
        ) : (
          items.map((item) => (
            <Card key={item.id} variant="outlined" className="flex items-center gap-4 p-3 hover:bg-surface-variant/20 transition-colors">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-variant">
                <Image src={`/api/material-image/${item.image}`} alt={item.title} fill className="object-contain p-2" sizes="48px" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface truncate">{item.title}</p>
                <p className="text-xs text-on-surface-variant font-medium">{item.subtitle}</p>
              </div>
            </Card>
          ))
        )}
      </div>
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
    <Card className="flex flex-col p-6" variant="outlined">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </Card>
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
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="mb-4 rounded-full bg-primary-container p-4 text-on-primary-container shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-on-surface">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-on-surface-variant">{description}</p>
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
    default: "bg-surface-variant text-on-surface-variant",
    success: "bg-primary-container text-on-primary-container",
    danger: "bg-error-container text-on-error-container"
  } as const;

  return (
    <Card variant="filled" className={cn("p-4", tones[tone])}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
}
