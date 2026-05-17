"use client";

import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  PackageSearch,
  Sparkles,
  Target,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  createGoalAction,
  deleteGoalAction,
  deleteGoalMaterialAction,
  saveGoalMaterialAction,
  saveInventoryAction,
  createMaterialAction,
  updateMaterialAction,
} from "@/app/actions";
import { AppShell } from "@/components/layout/app-shell";
import {
  rarityBorderMap,
  rarityColorMap,
  tabs,
  type DashboardTab,
} from "@/lib/constants";
import { simulateCraftingNeed } from "@/lib/crafting";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const generateMaterialIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type DashboardShellProps = {
  initialData: DashboardData;
  username: string;
  role?: string;
};

type InventoryDraft = Record<string, number>;

const overviewMeta = [
  { key: "totalTrackedMaterials", label: "Tracked Materials", icon: Target },
  { key: "totalInventory", label: "Inventory Total", icon: PackageSearch },
  { key: "activeGoals", label: "Active Goals", icon: Target },
  { key: "completedGoals", label: "Completed Goals", icon: Sparkles },
  { key: "craftableMaterials", label: "Craftable", icon: Sparkles },
] as const;

export function DashboardShell({
  initialData,
  username,
  role,
}: DashboardShellProps) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<DashboardTab>("inventory");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>(
    Object.fromEntries(
      initialData.materials.map((material) => [material.id, material.quantity]),
    ),
  );
  const [simulationMaterialId, setSimulationMaterialId] = useState(
    initialData.materials[0]?.id ?? "",
  );
  const [simulationRequired, setSimulationRequired] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialView | null>(null);
  const [editorForm, setEditorForm] = useState({
    id: "",
    name: "",
    iconName: "",
    rarity: 1,
    category: "",
    description: "",
    combinable: false,
    combineRatio: null as number | null,
    parentMaterialId: null as string | null,
  });
  const categories = useMemo(
    () => [
      "All",
      ...new Set(data.materials.map((material) => material.category)),
    ],
    [data.materials],
  );

  const materialCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(data.materials.map((material) => material.category)),
      ).map((category) => ({ label: category, value: category })),
    [data.materials],
  );

  const parentMaterialOptions = useMemo(
    () => [
      { label: "None", value: "" },
      ...data.materials
        .filter((material) => material.id !== editing?.id)
        .map((material) => ({
          label: `${material.name} (${material.id})`,
          value: material.id,
        })),
    ],
    [data.materials, editing?.id],
  );

  const filteredMaterials = useMemo(() => {
    return data.materials.filter((material) => {
      const matchesSearch =
        material.name.toLowerCase().includes(search.toLowerCase()) ||
        material.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || material.category === categoryFilter;

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
        quantity: material.quantity,
      })),
    );
  }, [data.materials, simulationMaterialId, simulationRequired]);

  function syncDashboard(nextData: DashboardData) {
    setData(nextData);
    setInventoryDraft(
      Object.fromEntries(
        nextData.materials.map((material) => [material.id, material.quantity]),
      ),
    );
    setSimulationMaterialId((current) =>
      nextData.materials.some((material) => material.id === current)
        ? current
        : (nextData.materials[0]?.id ?? ""),
    );
  }

  function handleInventorySave(materialId: string) {
    const nextQuantity = Math.max(0, Number(inventoryDraft[materialId] ?? 0));
    const previous = data;

    const optimistic: DashboardData = {
      ...data,
      materials: data.materials.map((material) =>
        material.id === materialId
          ? { ...material, quantity: nextQuantity }
          : material,
      ),
    } as DashboardData;

    syncDashboard(optimistic);

    startTransition(async () => {
      const result = await saveInventoryAction({
        materialId,
        quantity: nextQuantity,
      });

      if (!result.success || !result.data) {
        syncDashboard(previous);
        toast.error(result.error ?? "Unable to save inventory.");
        return;
      }

      syncDashboard(result.data);
      toast.success("Inventory updated.");
    });
  }

  const getIconNameFromImage = (image: string) => {
    const filename = image.split("/").pop() ?? "";
    return filename.replace(/\.png$/i, "");
  };

  function resetEditorForm() {
    setEditing(null);
    setEditorForm({
      id: "",
      name: "",
      iconName: "",
      rarity: 1,
      category: "",
      description: "",
      combinable: false,
      combineRatio: null,
      parentMaterialId: null,
    });
  }

  function openEditorForCreate() {
    resetEditorForm();
    setIsEditorOpen(true);
  }

  function openEditorForEdit(material: MaterialView) {
    setEditing(material);
    setEditorForm({
      id: material.id,
      name: material.name,
      iconName: getIconNameFromImage(material.image),
      rarity: material.rarity,
      category: material.category,
      description: material.description ?? "",
      combinable: material.combinable ?? false,
      combineRatio: material.combineRatio ?? null,
      parentMaterialId: material.parentMaterialId ?? null,
    });
    setIsEditorOpen(true);
  }

  async function handleEditorSave() {
    const previous = data;

    startTransition(async () => {
      try {
        const payload = { ...editorForm };

        const result = editing
          ? await updateMaterialAction(payload)
          : await createMaterialAction(payload);

        if (!result.success || !result.data) {
          toast.error(result.error ?? "Unable to save material.");
          return;
        }

        syncDashboard(result.data);
        toast.success("Material saved.");
        setIsEditorOpen(false);
        resetEditorForm();
      } catch (err) {
        console.error("Material save failed", err);
        toast.error("Unable to save material.");
        syncDashboard(previous);
      }
    });
  }

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Material Tracker
        </h1>
        <p className="text-on-surface-variant mt-2">
          Track inventory, goals, material chains, and recursive 3:1 crafting.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {overviewMeta.map((item) => (
          <Card key={item.key} variant="filled" className="p-5">
            <div className="text-on-surface-variant flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="text-on-surface mt-2 text-3xl font-bold">
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
                  <h2 className="text-on-surface text-xl font-bold">
                    Inventory
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    Search, filter, and update owned quantities.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <TextField
                    label="Search"
                    variant="outlined"
                    className="h-12"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <Select
                    label="Category"
                    variant="outlined"
                    className="h-12"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categories.map((category) => ({
                      label: category,
                      value: category,
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {filteredMaterials.length === 0 ? (
                  <EmptyState
                    icon={<PackageSearch className="h-8 w-8" />}
                    title="No materials"
                    description="No materials match your search or filters."
                  />
                ) : (
                  filteredMaterials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      quantity={inventoryDraft[material.id] ?? 0}
                      onChange={(value) =>
                        setInventoryDraft((prev) => ({
                          ...prev,
                          [material.id]: value,
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
                image: item.materialId,
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
                image: item.materialId,
              }))}
              title="Completed Materials"
              description="Goal requirements satisfied by current inventory."
              emptyText="Completed requirements will appear here."
            />
          </div>
        </section>
      ) : null}

      {activeTab === "goals" ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-on-surface text-2xl font-bold tracking-tight">
                Farming Goals
              </h2>
              <p className="text-on-surface-variant mt-1">
                Track and manage your farming objectives.
              </p>
            </div>
            <Link href={"/goals/new" as any}>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Goal
              </Button>
            </Link>
          </div>

          {data.goals.length === 0 ? (
            <Card variant="outlined" className="p-8">
              <EmptyState
                icon={<Target className="h-12 w-12" />}
                title="No Goals Yet"
                description="Create a goal and assign materials to start tracking."
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.goals.map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}` as any}>
                  <Card
                    variant="outlined"
                    className="h-full cursor-pointer p-6 transition-all hover:border-primary hover:shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-on-surface truncate font-bold">
                            {goal.name}
                          </h3>
                          <p className="text-on-surface-variant mt-1 line-clamp-2 text-sm">
                            {goal.description ?? "Custom farming plan"}
                          </p>
                        </div>
                        <ChevronRight className="text-on-surface-variant h-5 w-5 flex-shrink-0" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-on-surface-variant">
                            Progress
                          </span>
                          <span className="font-bold text-primary">
                            {goal.progressPercent}%
                          </span>
                        </div>
                        <Progress
                          value={goal.progressPercent}
                          className="h-2"
                        />
                      </div>

                      <div className="text-on-surface-variant flex items-center justify-between border-t border-outline-variant pt-2 text-xs">
                        <span>
                          {goal.materials.length} material
                          {goal.materials.length !== 1 ? "s" : ""}
                        </span>
                        <span>
                          {formatNumber(goal.totalRequired)} total needed
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "materials" ? (
        <>
          <Panel
            title="Material Library"
            description="Preloaded data with rarity colors and crafting links."
            action={
              role === "master" ? (
                <div className="flex gap-2">
                  <Button onClick={openEditorForCreate}>New Material</Button>
                  <Button onClick={() => setIsEditorOpen(true)}>
                    Edit Library
                  </Button>
                </div>
              ) : undefined
            }
          >
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data.materials.map((material) => (
                <Card
                  key={material.id}
                  variant="outlined"
                  className={cn(
                    "p-5 transition-transform hover:scale-[1.02]",
                    rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br",
                        rarityColorMap[material.rarity] ?? rarityColorMap[1],
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
                        <h3 className="text-on-surface font-bold">
                          {material.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {role === "master" ? (
                            <Button
                              variant="text"
                              onClick={() => openEditorForEdit(material)}
                            >
                              Edit
                            </Button>
                          ) : null}
                          <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-secondary-on-container">
                            {material.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
                        {material.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                          Rarity {material.rarity}
                        </span>
                        <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                          Owned {formatNumber(material.quantity)}
                        </span>
                        {material.combinable && material.parentMaterialId ? (
                          <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                            3:1 Crafting
                          </span>
                        ) : (
                          <span className="text-on-surface-variant rounded-full border border-outline-variant px-2.5 py-1 font-medium">
                            Highest tier
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Panel>
          {isEditorOpen && (
            <MaterialEditor
              open={isEditorOpen}
              close={() => setIsEditorOpen(false)}
              form={editorForm}
              setForm={setEditorForm}
              onSave={handleEditorSave}
              categoryOptions={materialCategoryOptions}
              parentOptions={parentMaterialOptions}
            />
          )}
        </>
      ) : null}

      {activeTab === "crafting" ? (
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr]">
          <Panel
            title="Crafting Simulator"
            description="Recursive 3:1 crafting preview."
          >
            <div className="mt-4 space-y-4">
              <Select
                label="Select Material"
                variant="outlined"
                value={simulationMaterialId}
                onChange={setSimulationMaterialId}
                options={data.materials.map((material) => ({
                  label: material.name,
                  value: material.id,
                }))}
              />
              <TextField
                label="Required Quantity"
                variant="outlined"
                type="number"
                min={0}
                value={simulationRequired}
                onChange={(event) =>
                  setSimulationRequired(Number(event.target.value))
                }
              />
            </div>
          </Panel>

          <Panel
            title="Simulation Result"
            description="Craftability and recursive breakdown."
          >
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
                  <StatPill
                    label="Requested"
                    value={formatNumber(simulation.requested)}
                  />
                  <StatPill
                    label="Total Available"
                    value={formatNumber(simulation.totalAvailable)}
                  />
                  <StatPill
                    label="Deficit"
                    value={formatNumber(simulation.remaining)}
                    tone={simulation.remaining > 0 ? "danger" : "success"}
                  />
                  <StatPill
                    label="Surplus"
                    value={formatNumber(simulation.surplus)}
                    tone={simulation.surplus > 0 ? "success" : "default"}
                  />
                </div>
                <Card variant="filled" className="p-5">
                  <p className="text-on-surface text-sm font-medium">
                    {simulation.craftable
                      ? `You can fully craft ${simulation.requested} ${data.materials.find((item) => item.id === simulation.materialId)?.name}.`
                      : `You are short by ${simulation.remaining} after recursive crafting.`}
                  </p>
                  <p className="text-on-surface-variant mt-2 text-xs">
                    Directly owned: {formatNumber(simulation.directOwned)}
                  </p>
                </Card>
                <div className="space-y-3">
                  <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">
                    Recursive sources
                  </h3>
                  <div className="grid gap-2">
                    {simulation.recursiveSources.length === 0 ? (
                      <p className="text-on-surface-variant text-sm italic">
                        No lower-tier materials needed.
                      </p>
                    ) : (
                      simulation.recursiveSources.map((source) => (
                        <div
                          key={source.materialId}
                          className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-3 text-sm"
                        >
                          <span className="font-medium">
                            {source.materialName}
                          </span>
                          <span className="font-bold text-primary">
                            {formatNumber(source.quantity)}
                          </span>
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

function MaterialEditor({
  open,
  close,
  form,
  setForm,
  onSave,
  categoryOptions,
  parentOptions,
}: {
  open: boolean;
  close: () => void;
  form: any;
  setForm: (next: any) => void;
  onSave: () => Promise<void> | void;
  categoryOptions: Array<{ label: string; value: string }>;
  parentOptions: Array<{ label: string; value: string }>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-6">
          <h3 className="text-on-surface mb-4 text-lg font-bold">
            Material Editor
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="ID"
              value={form.id}
              readOnly
              helperText="Auto-generated for new materials and fixed after creation."
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => {
                const nextName = e.target.value;
                setForm({
                  ...form,
                  name: nextName,
                  id: form.id || generateMaterialIdFromName(nextName),
                });
              }}
            />
            <TextField
              label="Icon Name"
              value={form.iconName}
              onChange={(e) => setForm({ ...form, iconName: e.target.value })}
              helperText="Enter the icon identifier like UI_ItemIcon_100001"
            />
            <Select
              label="Category"
              variant="outlined"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={categoryOptions}
            />
            <TextField
              label="Rarity"
              type="number"
              value={String(form.rarity)}
              onChange={(e) =>
                setForm({ ...form, rarity: Number(e.target.value) })
              }
            />
            <TextField
              label="Combine Ratio"
              type="number"
              value={form.combineRatio ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  combineRatio: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Select
              label="Parent Material"
              variant="outlined"
              value={form.parentMaterialId ?? ""}
              onChange={(value) =>
                setForm({ ...form, parentMaterialId: value || null })
              }
              options={parentOptions}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="text" onClick={close}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MaterialCard({
  material,
  quantity,
  onChange,
  onSave,
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
        rarityBorderMap[material.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[material.rarity] ?? rarityColorMap[1],
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
          <h3 className="text-on-surface truncate font-bold">
            {material.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            <span className="text-on-surface-variant rounded-full bg-surface-variant px-2 py-0.5 font-medium">
              {material.category}
            </span>
            <span className="text-on-primary-container rounded-full bg-primary-container px-2 py-0.5 font-medium">
              Craftable {formatNumber(material.totalCraftable)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1">
          <TextField
            variant="outlined"
            type="number"
            min={0}
            className="h-11"
            value={quantity}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </div>
        <Button variant="filled" className="h-11 px-4" onClick={onSave}>
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function SummaryList({
  title,
  description,
  items,
  emptyText,
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
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title={title}
            description={emptyText}
          />
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              className="flex items-center gap-4 p-3 transition-colors hover:bg-surface-variant/20"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-variant">
                <Image
                  src={`/api/material-image/${item.image}`}
                  alt={item.title}
                  fill
                  className="object-contain p-2"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-on-surface truncate font-bold">
                  {item.title}
                </p>
                <p className="text-on-surface-variant text-xs font-medium">
                  {item.subtitle}
                </p>
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
  action,
}: PropsWithChildren<{
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <Card className="flex flex-col p-6" variant="outlined">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-on-surface text-xl font-bold">{title}</h2>
          <p className="text-on-surface-variant text-sm">{description}</p>
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
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-on-primary-container mb-4 rounded-full bg-primary-container p-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-on-surface font-bold">{title}</h3>
      <p className="text-on-surface-variant mt-2 max-w-sm text-sm">
        {description}
      </p>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const tones = {
    default: "bg-surface-variant text-on-surface-variant",
    success: "bg-primary-container text-on-primary-container",
    danger: "bg-error-container text-on-error-container",
  } as const;

  return (
    <Card variant="filled" className={cn("p-4", tones[tone])}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
}
