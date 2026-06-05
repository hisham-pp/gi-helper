"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  createMaterialAction,
  saveInventoryAction,
  updateMaterialAction,
} from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import type { MaterialEditorForm } from "@/components/dashboard/material-editor";
import { OverviewStatsGrid } from "@/components/dashboard/overview-stats";
import { CraftingSection } from "@/components/dashboard/sections/crafting-section";
import { GoalsSection } from "@/components/dashboard/sections/goals-section";
import { InventorySection } from "@/components/dashboard/inventory/inventory-section";
import { MaterialsSection } from "@/components/dashboard/sections/materials-section";
import {
  aggregateNeededMaterials,
  buildDashboardData,
  evaluateGoal,
  simulateCraftingNeed,
} from "@/lib/crafting";
import { compareMaterialCategories } from "@/lib/material-sort";
import type { DashboardTab } from "@/lib/constants";
import type { DashboardData, GoalView, MaterialView } from "@/lib/types";

type DashboardShellProps = {
  initialData: DashboardData;
  username: string;
  role?: string;
  isAuthenticated?: boolean;
  view?: "tracker" | "inventory" | "goals";
};

type InventoryDraft = Record<string, number>;

const emptyEditorForm: MaterialEditorForm = {
  id: "",
  name: "",
  iconName: "",
  rarity: 1,
  category: "",
  description: "",
  combinable: false,
  combineRatio: null,
  parentMaterialId: null,
};

export function DashboardShell({
  initialData,
  isAuthenticated = true,
  role,
  view = "tracker",
}: DashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab: DashboardTab =
    tabFromUrl === "crafting" || tabFromUrl === "materials"
      ? tabFromUrl
      : "materials";

  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [inventoryTab, setInventoryTab] = useState<"needed" | "edit">("needed");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [shoppingSearch, setShoppingSearch] = useState("");
  const [shoppingCharacterFilter, setShoppingCharacterFilter] = useState("All");
  const [shoppingGoalTypeFilter, setShoppingGoalTypeFilter] = useState("All");
  const [shoppingMaterialTypeFilter, setShoppingMaterialTypeFilter] =
    useState("All");
  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>(
    buildInventoryDraft(initialData),
  );
  const [simulationMaterialId, setSimulationMaterialId] = useState(
    initialData.materials[0]?.id ?? "",
  );
  const [simulationRequired, setSimulationRequired] = useState(1);
  const [goalFilter, setGoalFilter] = useState<
    "incomplete" | "completed" | "all"
  >("incomplete");
  const [goalSearch, setGoalSearch] = useState("");
  const [goalCharacterFilter, setGoalCharacterFilter] = useState("All");
  const [goalCategoryFilter, setGoalCategoryFilter] = useState("All");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialView | null>(null);
  const [editorForm, setEditorForm] =
    useState<MaterialEditorForm>(emptyEditorForm);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (view !== "tracker") {
      return;
    }
    if (tabFromUrl === "crafting" || tabFromUrl === "materials") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, view]);

  const syncDashboard = useCallback((nextData: DashboardData) => {
    setData(nextData);
    setInventoryDraft(buildInventoryDraft(nextData));
    setSimulationMaterialId((current) =>
      nextData.materials.some((material) => material.id === current)
        ? current
        : (nextData.materials[0]?.id ?? ""),
    );
  }, []);

  useEffect(() => {
    syncDashboard(initialData);
  }, [initialData, syncDashboard]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(data.materials.map((material) => material.category)),
      ).sort(compareMaterialCategories),
    ],
    [data.materials],
  );

  const materialCategoryOptions = useMemo(
    () =>
      Array.from(new Set(data.materials.map((material) => material.category)))
        .sort(compareMaterialCategories)
        .map((category) => ({ label: category, value: category })),
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
    const searchLower = search.trim().toLowerCase();

    return data.materials.filter((material) => {
      const matchesSearch =
        searchLower.length === 0 ||
        getMaterialSearchText(material).includes(searchLower);
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
      data.materials,
    );
  }, [data.materials, simulationMaterialId, simulationRequired]);

  const goalCharacters = useMemo(() => {
    const chars = new Set(
      data.goals
        .map((goal) => goal.characterName)
        .filter((name): name is string => Boolean(name)),
    );
    return ["All", ...Array.from(chars).sort()];
  }, [data.goals]);

  const goalCategories = useMemo(() => {
    const cats = new Set(
      data.goals
        .map((goal) => goal.category)
        .filter((category): category is string => Boolean(category)),
    );
    return ["All", ...Array.from(cats).sort()];
  }, [data.goals]);

  const shoppingCharacters = useMemo(() => {
    const chars = new Set(
      data.goals
        .filter((goal) => !goal.completed)
        .map((goal) => goal.characterName)
        .filter((name): name is string => Boolean(name)),
    );
    return ["All", ...Array.from(chars).sort()];
  }, [data.goals]);

  const shoppingGoalTypes = useMemo(() => {
    const types = new Set(
      data.goals
        .filter((goal) => !goal.completed)
        .map((goal) => goal.category)
        .filter((category): category is string => Boolean(category)),
    );
    return ["All", ...Array.from(types).sort()];
  }, [data.goals]);

  const shoppingMaterialTypes = useMemo(() => {
    const types = new Set(
      data.goals
        .filter((goal) => !goal.completed)
        .flatMap((goal) => goal.materials.map((material) => material.category)),
    );
    return ["All", ...Array.from(types).sort(compareMaterialCategories)];
  }, [data.goals]);

  const filteredShoppingMaterials = useMemo(() => {
    const searchLower = shoppingSearch.trim().toLowerCase();

    const goals = data.goals.filter((goal) => {
      if (goal.completed) {
        return false;
      }
      if (
        shoppingCharacterFilter !== "All" &&
        goal.characterName !== shoppingCharacterFilter
      ) {
        return false;
      }
      if (
        shoppingGoalTypeFilter !== "All" &&
        goal.category !== shoppingGoalTypeFilter
      ) {
        return false;
      }

      return true;
    });

    const materialsStillNeeded = aggregateNeededMaterials(
      goals,
      data.materials,
      searchLower,
    );

    if (shoppingMaterialTypeFilter === "All") {
      return materialsStillNeeded;
    }

    return materialsStillNeeded.filter(
      (material) => material.category === shoppingMaterialTypeFilter,
    );
  }, [
    data.goals,
    data.materials,
    shoppingCharacterFilter,
    shoppingGoalTypeFilter,
    shoppingMaterialTypeFilter,
    shoppingSearch,
  ]);

  const filteredGoals = useMemo(() => {
    return data.goals.filter((goal) => {
      const isCompleted = goal.completed;

      if (goalFilter === "completed" && !isCompleted) return false;
      if (goalFilter === "incomplete" && isCompleted) return false;
      if (
        goalCharacterFilter !== "All" &&
        goal.characterName !== goalCharacterFilter
      ) {
        return false;
      }
      if (
        goalCategoryFilter !== "All" &&
        goal.category !== goalCategoryFilter
      ) {
        return false;
      }

      if (!goalSearch) {
        return true;
      }

      const searchLower = goalSearch.toLowerCase();
      return (
        goal.name.toLowerCase().includes(searchLower) ||
        (goal.description ?? "").toLowerCase().includes(searchLower)
      );
    });
  }, [
    data.goals,
    goalCategoryFilter,
    goalCharacterFilter,
    goalFilter,
    goalSearch,
  ]);

  function handleInventorySave(materialId: string) {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const nextQuantity = Math.max(0, Number(inventoryDraft[materialId] ?? 0));
    const previous = data;

    syncDashboard(applyInventoryQuantity(data, materialId, nextQuantity));

    startTransition(async () => {
      const result = await saveInventoryAction({
        materialId,
        quantity: nextQuantity,
      });

      if (!result.success) {
        syncDashboard(previous);
        toast.error(result.error ?? "Unable to save inventory.");
        return;
      }

      toast.success("Inventory updated.");
    });
  }

  function handleRefreshDashboard() {
    startTransition(() => {
      router.refresh();
    });
  }

  function resetEditorForm() {
    setEditing(null);
    setEditorForm(emptyEditorForm);
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

  async function handleEditorSave(values: MaterialEditorForm) {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const previous = data;

    startTransition(async () => {
      try {
        const result = editing
          ? await updateMaterialAction(values)
          : await createMaterialAction(values);

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

  const pageTitle =
    view === "inventory"
      ? "Inventory"
      : view === "goals"
        ? "Farming Goals"
        : "Material Tracker";

  const pageDescription =
    view === "inventory"
      ? "Update owned material quantities for all farming goals."
      : view === "goals"
        ? "Track progress and open a goal for details."
        : "Material library, crafting chains, and recursive 3:1 simulation.";

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-on-surface-variant mt-2">{pageDescription}</p>
      </header>

      {view === "tracker" ? (
        <>
          <OverviewStatsGrid overview={data.overview} />
          <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === "materials" ? (
            <MaterialsSection
              categories={categories}
              categoryFilter={categoryFilter}
              categoryOptions={materialCategoryOptions}
              closeEditor={() => setIsEditorOpen(false)}
              editorForm={editorForm}
              isEditorOpen={isEditorOpen}
              isMaster={role === "master"}
              materials={filteredMaterials}
              parentOptions={parentMaterialOptions}
              search={search}
              setCategoryFilter={setCategoryFilter}
              setSearch={setSearch}
              onCreate={openEditorForCreate}
              onEdit={openEditorForEdit}
              onSave={handleEditorSave}
            />
          ) : null}
          {activeTab === "crafting" ? (
            <CraftingSection
              materials={data.materials}
              required={simulationRequired}
              selectedMaterialId={simulationMaterialId}
              simulation={simulation}
              setRequired={setSimulationRequired}
              setSelectedMaterialId={setSimulationMaterialId}
            />
          ) : null}
        </>
      ) : null}

      {view === "inventory" ? (
        <InventorySection
          activeTab={inventoryTab}
          categories={categories}
          categoryFilter={categoryFilter}
          shoppingCharacterFilter={shoppingCharacterFilter}
          shoppingCharacters={shoppingCharacters}
          shoppingGoalTypeFilter={shoppingGoalTypeFilter}
          shoppingGoalTypes={shoppingGoalTypes}
          shoppingMaterialTypeFilter={shoppingMaterialTypeFilter}
          shoppingMaterialTypes={shoppingMaterialTypes}
          shoppingSearch={shoppingSearch}
          filteredMaterials={filteredMaterials}
          inventoryDraft={inventoryDraft}
          materialsStillNeeded={filteredShoppingMaterials}
          search={search}
          setActiveTab={setInventoryTab}
          setCategoryFilter={setCategoryFilter}
          setShoppingCharacterFilter={setShoppingCharacterFilter}
          setShoppingGoalTypeFilter={setShoppingGoalTypeFilter}
          setShoppingMaterialTypeFilter={setShoppingMaterialTypeFilter}
          setShoppingSearch={setShoppingSearch}
          setInventoryDraft={setInventoryDraft}
          setSearch={setSearch}
          isRefreshing={isPending}
          onRefresh={handleRefreshDashboard}
          onSaveMaterial={handleInventorySave}
        />
      ) : null}

      {view === "goals" ? (
        <GoalsSection
          categories={goalCategories}
          categoryFilter={goalCategoryFilter}
          characterFilter={goalCharacterFilter}
          characters={goalCharacters}
          goals={filteredGoals}
          search={goalSearch}
          statusFilter={goalFilter}
          setCategoryFilter={setGoalCategoryFilter}
          setCharacterFilter={setGoalCharacterFilter}
          setSearch={setGoalSearch}
          setStatusFilter={setGoalFilter}
        />
      ) : null}
      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}

function buildInventoryDraft(data: DashboardData): InventoryDraft {
  return Object.fromEntries(
    data.materials.map((material) => [material.id, material.quantity]),
  );
}

function applyInventoryQuantity(
  data: DashboardData,
  materialId: string,
  quantity: number,
) {
  const materials = data.materials.map((material) =>
    material.id === materialId ? { ...material, quantity } : material,
  );
  const goals = data.goals.map((goal) =>
    evaluateGoal(
      {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        completed: goal.completed,
        characterId: goal.characterId,
        characterName: goal.characterName,
        category: goal.category,
        materials: goal.materials.map((item) => ({
          id: item.id,
          materialId: item.materialId,
          required: item.required,
        })),
      },
      materials,
    ),
  );

  return buildDashboardData(materials, goals);
}

function getIconNameFromImage(image: string) {
  const filename = image.split("/").pop() ?? "";
  return filename.replace(/\.png$/i, "");
}

function getMaterialSearchText(material: MaterialView) {
  const categoryPlural = material.category.endsWith("s")
    ? material.category
    : `${material.category}s`;

  return [
    material.id,
    material.name,
    material.category,
    categoryPlural,
    material.description,
  ]
    .join(" ")
    .toLowerCase();
}
