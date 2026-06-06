"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Check,
  ChefHat,
  Flame,
  PackageSearch,
  Save,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  cookRecipeAction,
  saveCookingInventoryAction,
  saveCookingProgressAction,
} from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import AppTextField from "@/components/core/app-textfield";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/core/app-select";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type {
  CookingData,
  CookingNeededIngredient,
  CookingRecipeView,
} from "@/lib/cooking-data";
import { cn, formatNumber } from "@/lib/utils";

type CookingTab = "needed" | "inventory" | "recipes";
type CookingStatusFilter =
  | "All"
  | "Needs cooking"
  | "Ready to cook"
  | "Missing ingredients"
  | "Auto unlocked";
type QuantityDraft = Record<string, number>;

type CookingApiResponse = {
  data?: CookingData;
  user?: {
    username: string;
    role: string;
  } | null;
};

const emptyCookingData: CookingData = {
  ingredients: [],
  recipes: [],
  neededIngredients: [],
  stats: {
    totalRecipes: 0,
    achievedAuto: 0,
    totalCompleted: 0,
    neededIngredients: 0,
  },
};

export function CookingPage({
  initialData,
  isAuthenticated = false,
}: {
  initialData?: CookingData;
  isAuthenticated?: boolean;
}) {
  const [data, setData] = useState(initialData ?? emptyCookingData);
  const [canPersist, setCanPersist] = useState(isAuthenticated);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadRequest, setLoadRequest] = useState(0);
  const [activeTab, setActiveTab] = useState<CookingTab>("needed");
  const [search, setSearch] = useState("");
  const [neededSearch, setNeededSearch] = useState("");
  const [neededRecipeId, setNeededRecipeId] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<CookingStatusFilter>("All");
  const [inventoryDraft, setInventoryDraft] = useState<QuantityDraft>(
    buildInventoryDraft(initialData ?? emptyCookingData),
  );
  const [progressDraft, setProgressDraft] = useState<QuantityDraft>(
    buildProgressDraft(initialData ?? emptyCookingData),
  );
  const [cookDraft, setCookDraft] = useState<QuantityDraft>(
    buildCookDraft(initialData ?? emptyCookingData),
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();

    async function loadCookingData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/cooking", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Cooking data request failed.");
        }

        const payload = (await response.json()) as CookingApiResponse;

        if (!payload.data) {
          throw new Error("Cooking data response was empty.");
        }

        setData(payload.data);
        setInventoryDraft(buildInventoryDraft(payload.data));
        setProgressDraft(buildProgressDraft(payload.data));
        setCookDraft(buildCookDraft(payload.data));
        setCanPersist(Boolean(payload.user));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Cooking data load failed", error);
        setLoadError("Cooking data could not be loaded.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCookingData();

    return () => {
      controller.abort();
    };
  }, [loadRequest]);

  const syncCooking = (nextData: CookingData) => {
    setData(nextData);
    setInventoryDraft(buildInventoryDraft(nextData));
    setProgressDraft(buildProgressDraft(nextData));
    setCookDraft(buildCookDraft(nextData));
  };

  const recipeTypes = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(data.recipes.map((recipe) => recipe.type))).sort(),
    ];
  }, [data.recipes]);

  const readyRecipeCount = useMemo(() => {
    return data.recipes.filter((recipe) => getCookQuantityLimit(recipe) > 0)
      .length;
  }, [data.recipes]);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.recipes.filter((recipe) => {
      if (typeFilter !== "All" && recipe.type !== typeFilter) {
        return false;
      }

      if (statusFilter === "Auto unlocked" && !recipe.achievedAuto) {
        return false;
      }

      if (statusFilter === "Needs cooking" && recipe.achievedAuto) {
        return false;
      }

      if (
        statusFilter === "Ready to cook" &&
        getCookQuantityLimit(recipe) === 0
      ) {
        return false;
      }

      if (
        statusFilter === "Missing ingredients" &&
        (recipe.achievedAuto || getCookQuantityLimit(recipe) > 0)
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        recipe.name.toLowerCase().includes(query) ||
        recipe.type.toLowerCase().includes(query) ||
        recipe.effect.toLowerCase().includes(query)
      );
    });
  }, [data.recipes, search, statusFilter, typeFilter]);

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.ingredients.filter((ingredient) => {
      return (
        !query ||
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.description.toLowerCase().includes(query)
      );
    });
  }, [data.ingredients, search]);

  function handleInventorySave(materialId: string) {
    if (!canPersist) {
      setShowLoginPrompt(true);
      return;
    }

    const pendingKey = `inventory:${materialId}`;
    const nextQuantity = Math.max(0, Number(inventoryDraft[materialId] ?? 0));
    const previous = data;

    setPendingAction(pendingKey);
    syncCooking(applyCookingInventoryQuantity(data, materialId, nextQuantity));

    startTransition(async () => {
      try {
        const result = await saveCookingInventoryAction({
          materialId,
          quantity: nextQuantity,
        });

        if (!result.success) {
          syncCooking(previous);
          toast.error(result.error ?? "Unable to save inventory.");
          return;
        }

        toast.success("Cooking inventory updated.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleProgressSave(recipeId: string) {
    if (!canPersist) {
      setShowLoginPrompt(true);
      return;
    }

    const nextCount = Math.max(0, Number(progressDraft[recipeId] ?? 0));
    const pendingKey = `progress:${recipeId}`;

    setPendingAction(pendingKey);
    startTransition(async () => {
      try {
        const result = await saveCookingProgressAction({
          recipeId,
          completedCount: nextCount,
        });

        if (!result.success || !result.data) {
          toast.error(result.error ?? "Unable to save cooking progress.");
          return;
        }

        syncCooking(result.data);
        toast.success("Cooking progress saved.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleCook(recipeId: string) {
    if (!canPersist) {
      setShowLoginPrompt(true);
      return;
    }

    const recipe = data.recipes.find((item) => item.id === recipeId);
    const quantityLimit = recipe ? getCookQuantityLimit(recipe) : 1;
    const quantity = Math.min(
      quantityLimit,
      Math.max(1, Math.floor(Number(cookDraft[recipeId] ?? 1))),
    );
    const pendingKey = `cook:${recipeId}`;

    if (!recipe || quantityLimit <= 0) {
      toast.error("This recipe needs more ingredients first.");
      return;
    }

    setPendingAction(pendingKey);
    startTransition(async () => {
      try {
        const result = await cookRecipeAction({
          recipeId,
          quantity,
        });

        if (!result.success || !result.data) {
          toast.error(result.error ?? "Unable to cook recipe.");
          return;
        }

        syncCooking(result.data);
        toast.success(
          quantity === 1
            ? "Recipe cooked and ingredients deducted."
            : `${formatNumber(quantity)} recipes cooked and ingredients deducted.`,
        );
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Cooking
        </h1>
        <p className="text-on-surface-variant mt-2">
          Track recipe proficiency, ingredient stock, and auto cooking unlocks.
        </p>
      </header>

      {isLoading ? (
        <CookingDataLoading />
      ) : loadError ? (
        <Card variant="outlined" className="p-6">
          <p className="text-sm font-bold text-error">
            Unable to load cooking data
          </p>
          <p className="text-on-surface-variant mt-1 text-sm">{loadError}</p>
          <Button
            className="mt-4"
            type="button"
            variant="tonal"
            onClick={() => setLoadRequest((current) => current + 1)}
          >
            Retry
          </Button>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Recipes" value={data.stats.totalRecipes} />
            <StatCard label="Auto Unlocked" value={data.stats.achievedAuto} />
            <StatCard label="Ready Now" value={readyRecipeCount} />
            <StatCard label="Cooked Count" value={data.stats.totalCompleted} />
            <StatCard
              label="Need Farming"
              value={data.stats.neededIngredients}
            />
          </section>

          <nav
            className="flex items-center justify-center"
            aria-label="Cooking views"
          >
            <div
              role="tablist"
              className="flex flex-wrap justify-center gap-2 rounded-full bg-surface-variant/50 p-1"
            >
              <TabButton
                active={activeTab === "needed"}
                icon={<Search className="h-4 w-4" />}
                label="Needed Ingredients"
                onClick={() => setActiveTab("needed")}
              />
              <TabButton
                active={activeTab === "inventory"}
                icon={<PackageSearch className="h-4 w-4" />}
                label="Inventory"
                onClick={() => setActiveTab("inventory")}
              />
              <TabButton
                active={activeTab === "recipes"}
                icon={<Flame className="h-4 w-4" />}
                label="Recipes"
                onClick={() => setActiveTab("recipes")}
              />
            </div>
          </nav>

          {activeTab === "needed" ? (
            <NeededIngredients
              data={data}
              recipeId={neededRecipeId}
              search={neededSearch}
              setRecipeId={setNeededRecipeId}
              setSearch={setNeededSearch}
            />
          ) : activeTab === "inventory" ? (
            <InventoryTab
              ingredients={filteredIngredients}
              inventoryDraft={inventoryDraft}
              pendingAction={pendingAction}
              search={search}
              setInventoryDraft={setInventoryDraft}
              setSearch={setSearch}
              onSave={handleInventorySave}
            />
          ) : (
            <RecipesTab
              cookDraft={cookDraft}
              pendingAction={pendingAction}
              progressDraft={progressDraft}
              recipeTypes={recipeTypes}
              recipes={filteredRecipes}
              search={search}
              setProgressDraft={setProgressDraft}
              setCookDraft={setCookDraft}
              setSearch={setSearch}
              setStatusFilter={setStatusFilter}
              setTypeFilter={setTypeFilter}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onCook={handleCook}
              onSave={handleProgressSave}
            />
          )}
        </>
      )}
      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="filled" className="p-6">
      <p className="text-on-surface-variant text-sm font-medium">{label}</p>
      <p className="text-on-surface mt-2 text-3xl font-black">
        {formatNumber(value)}
      </p>
    </Card>
  );
}

function CookingDataLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} variant="filled" className="p-6">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-variant/40" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-surface-variant/40" />
          </Card>
        ))}
      </section>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-2 rounded-full bg-surface-variant/50 p-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-36 animate-pulse rounded-full bg-surface-variant/40"
            />
          ))}
        </div>
      </div>
      <Card variant="outlined" className="p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-surface-variant/40" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-surface-variant/40" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-surface-variant/25"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      role="tab"
      aria-selected={active}
      variant={active ? "filled" : "text"}
      onClick={onClick}
      className="h-10 px-5"
    >
      {icon}
      {label}
    </Button>
  );
}

function NeededIngredients({
  data,
  recipeId,
  search,
  setRecipeId,
  setSearch,
}: {
  data: CookingData;
  recipeId: string;
  search: string;
  setRecipeId: (value: string) => void;
  setSearch: (value: string) => void;
}) {
  const recipeOptions = useMemo(
    () => [
      { label: "All recipes", value: "All" },
      ...data.recipes.map((recipe) => ({
        label: recipe.name,
        value: recipe.id,
      })),
    ],
    [data.recipes],
  );
  const filteredNeededIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rarityByMaterialId = new Map(
      data.ingredients.map((ingredient) => [ingredient.id, ingredient.rarity]),
    );
    const selectedRecipe =
      recipeId === "All"
        ? null
        : (data.recipes.find((recipe) => recipe.id === recipeId) ?? null);
    const ingredients = selectedRecipe
      ? getRecipeNeededIngredients(selectedRecipe, rarityByMaterialId)
      : data.neededIngredients;

    return ingredients.filter((ingredient) => {
      if (ingredient.remaining <= 0) {
        return false;
      }

      return (
        !query ||
        ingredient.name.toLowerCase().includes(query) ||
        selectedRecipe?.name.toLowerCase().includes(query)
      );
    });
  }, [
    data.ingredients,
    data.neededIngredients,
    data.recipes,
    recipeId,
    search,
  ]);

  return (
    <Card className="overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(14rem,20rem)_minmax(16rem,24rem)] lg:items-center">
          <div>
            <h2 className="text-on-surface text-xl font-bold">
              Needed Ingredients
            </h2>
            <p className="text-on-surface-variant text-sm">
              Ingredients still missing to unlock auto cooking for every recipe.
            </p>
          </div>
          <AppTextField
            label="Search ingredients"
            variant="outlined"
            className="h-12"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Recipe"
            variant="outlined"
            className="h-12"
            value={recipeId}
            onChange={setRecipeId}
            options={recipeOptions}
          />
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {filteredNeededIngredients.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No ingredients needed"
            description="The current recipe and search filters have no missing ingredients."
          />
        ) : (
          filteredNeededIngredients.map((ingredient) => (
            <Card
              key={ingredient.materialId}
              variant="outlined"
              className={cn(
                "flex items-center gap-4 p-4",
                rarityBorderMap[ingredient.rarity] ?? rarityBorderMap[1],
              )}
            >
              <MaterialImage
                id={ingredient.materialId}
                name={ingredient.name}
                rarity={ingredient.rarity}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-on-surface truncate text-sm font-bold">
                  {ingredient.name}
                </h3>
                <p className="mt-0.5 text-lg font-black text-primary">
                  {formatNumber(ingredient.remaining)}
                </p>
                <p className="text-on-surface-variant text-xs font-medium">
                  {formatNumber(ingredient.owned)} /{" "}
                  {formatNumber(ingredient.required)} owned
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}

function InventoryTab({
  ingredients,
  inventoryDraft,
  pendingAction,
  search,
  setInventoryDraft,
  setSearch,
  onSave,
}: {
  ingredients: CookingData["ingredients"];
  inventoryDraft: QuantityDraft;
  pendingAction: string | null;
  search: string;
  setInventoryDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setSearch: (value: string) => void;
  onSave: (materialId: string) => void;
}) {
  return (
    <Card className="overflow-hidden" variant="outlined">
      <div className="border-b border-outline-variant bg-surface p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div>
            <h2 className="text-on-surface text-xl font-bold">
              Cooking Inventory
            </h2>
            <p className="text-on-surface-variant text-sm">
              Update ingredient stock used by recipes.
            </p>
          </div>
          <AppTextField
            label="Search ingredients"
            variant="outlined"
            className="h-12"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {ingredients.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" />}
            title="No ingredients found"
            description="Try a different ingredient search."
          />
        ) : (
          ingredients.map((ingredient) => {
            const isSaving = pendingAction === `inventory:${ingredient.id}`;

            return (
              <Card
                key={ingredient.id}
                variant="outlined"
                className={cn(
                  "p-4",
                  rarityBorderMap[ingredient.rarity] ?? rarityBorderMap[1],
                )}
              >
                <div className="flex items-center gap-4">
                  <MaterialImage
                    id={ingredient.id}
                    name={ingredient.name}
                    rarity={ingredient.rarity}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-on-surface truncate font-bold">
                      {ingredient.name}
                    </h3>
                    <p className="text-on-surface-variant text-xs">
                      {ingredient.category}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1">
                    <AppTextField
                      label="Quantity"
                      variant="outlined"
                      type="number"
                      min={0}
                      className="h-11"
                      value={inventoryDraft[ingredient.id] ?? 0}
                      disabled={isSaving}
                      onChange={(event) =>
                        setInventoryDraft((current) => ({
                          ...current,
                          [ingredient.id]: Number(event.target.value),
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onSave(ingredient.id);
                        }
                      }}
                    />
                  </div>
                  <Button
                    aria-label={`Save ${ingredient.name} quantity`}
                    className="h-11 px-4"
                    onClick={() => onSave(ingredient.id)}
                    disabled={Boolean(pendingAction)}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? "Saving" : null}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
}

function RecipesTab({
  cookDraft,
  pendingAction,
  progressDraft,
  recipes,
  recipeTypes,
  search,
  statusFilter,
  typeFilter,
  setCookDraft,
  setProgressDraft,
  setSearch,
  setStatusFilter,
  setTypeFilter,
  onCook,
  onSave,
}: {
  cookDraft: QuantityDraft;
  pendingAction: string | null;
  progressDraft: QuantityDraft;
  recipes: CookingRecipeView[];
  recipeTypes: string[];
  search: string;
  statusFilter: CookingStatusFilter;
  typeFilter: string;
  setCookDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setProgressDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setSearch: (value: string) => void;
  setStatusFilter: (value: CookingStatusFilter) => void;
  setTypeFilter: (value: string) => void;
  onCook: (recipeId: string) => void;
  onSave: (recipeId: string) => void;
}) {
  return (
    <section className="space-y-6">
      <Card variant="outlined" className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <AppTextField
            label="Search recipes"
            variant="outlined"
            className="h-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Type"
            variant="outlined"
            className="h-11"
            value={typeFilter}
            onChange={setTypeFilter}
            options={recipeTypes.map((type) => ({ label: type, value: type }))}
          />
          <Select
            label="Status"
            variant="outlined"
            className="h-11"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as CookingStatusFilter)}
            options={(
              [
                "All",
                "Needs cooking",
                "Ready to cook",
                "Missing ingredients",
                "Auto unlocked",
              ] satisfies CookingStatusFilter[]
            ).map((status) => ({
              label: status,
              value: status,
            }))}
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {recipes.length === 0 ? (
          <Card variant="outlined" className="p-12">
            <EmptyState
              icon={<Search className="h-8 w-8" />}
              title="No recipes found"
              description="Try a different recipe search or filter."
            />
          </Card>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              cookValue={cookDraft[recipe.id] ?? 1}
              isCookPending={pendingAction === `cook:${recipe.id}`}
              isProgressPending={pendingAction === `progress:${recipe.id}`}
              pendingAction={pendingAction}
              progressValue={progressDraft[recipe.id] ?? 0}
              recipe={recipe}
              setCookDraft={setCookDraft}
              setProgressDraft={setProgressDraft}
              onCook={() => onCook(recipe.id)}
              onSave={() => onSave(recipe.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function RecipeCard({
  cookValue,
  isCookPending,
  isProgressPending,
  pendingAction,
  progressValue,
  recipe,
  setCookDraft,
  setProgressDraft,
  onCook,
  onSave,
}: {
  cookValue: number;
  isCookPending: boolean;
  isProgressPending: boolean;
  pendingAction: string | null;
  progressValue: number;
  recipe: CookingRecipeView;
  setCookDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setProgressDraft: Dispatch<SetStateAction<QuantityDraft>>;
  onCook: () => void;
  onSave: () => void;
}) {
  const progressPercent =
    recipe.proficiency === 0
      ? 100
      : Math.min(
          Math.round((recipe.completedCount / recipe.proficiency) * 100),
          100,
        );
  const cookQuantityLimit = getCookQuantityLimit(recipe);
  const canCook = cookQuantityLimit > 0;
  const shortageSummary = getRecipeShortageSummary(recipe);
  const normalizedCookValue = Math.max(
    1,
    Math.min(cookValue, cookQuantityLimit || 1),
  );
  const hasPendingAction = Boolean(pendingAction);

  return (
    <Card
      variant="outlined"
      className={cn(
        "p-5",
        rarityBorderMap[recipe.rarity] ?? rarityBorderMap[1],
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
            rarityColorMap[recipe.rarity] ?? rarityColorMap[1],
          )}
        >
          <Image
            src={`/api/recipe-image/${recipe.id}`}
            alt=""
            fill
            className="object-contain p-1.5"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-on-surface truncate font-bold">
                {recipe.name}
              </h3>
              <p className="text-on-surface-variant text-xs font-medium">
                {recipe.type}
              </p>
            </div>
            {recipe.achievedAuto ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-xs font-bold text-primary">
                <Check className="h-3.5 w-3.5" />
                Auto
              </span>
            ) : canCook ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-xs font-bold text-primary">
                <ChefHat className="h-3.5 w-3.5" />
                Ready x{formatNumber(cookQuantityLimit)}
              </span>
            ) : (
              <span className="text-on-surface-variant inline-flex items-center gap-1 rounded-full border border-outline-variant px-2.5 py-1 text-xs font-bold">
                Missing
              </span>
            )}
          </div>
          <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
            {recipe.effect || recipe.description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Proficiency</span>
          <span className="font-bold text-primary">
            {formatNumber(recipe.completedCount)} /{" "}
            {formatNumber(recipe.proficiency)}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {recipe.ingredients.map((ingredient) => (
          <span
            key={ingredient.materialId}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium",
              ingredient.owned >= ingredient.quantity
                ? "border-primary/30 bg-primary/5 text-primary"
                : "text-on-surface-variant border-outline-variant",
            )}
          >
            {ingredient.name} {formatNumber(ingredient.owned)} /{" "}
            {formatNumber(ingredient.quantity)}
          </span>
        ))}
      </div>

      {!recipe.achievedAuto && !canCook && shortageSummary ? (
        <p className="text-on-surface-variant mt-3 text-xs">
          Missing {shortageSummary}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <AppTextField
            label="Completed"
            variant="outlined"
            type="number"
            min={0}
            className="h-11"
            value={progressValue}
            disabled={isProgressPending}
            onChange={(event) =>
              setProgressDraft((current) => ({
                ...current,
                [recipe.id]: Number(event.target.value),
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSave();
              }
            }}
          />
          <Button
            variant="outlined"
            className="h-11 px-4"
            onClick={onSave}
            disabled={hasPendingAction}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isProgressPending ? "Saving" : "Save"}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <AppTextField
            label="Cook"
            variant="outlined"
            type="number"
            min={1}
            max={Math.max(cookQuantityLimit, 1)}
            className="h-11"
            value={normalizedCookValue}
            disabled={!canCook || isCookPending}
            onChange={(event) =>
              setCookDraft((current) => ({
                ...current,
                [recipe.id]: Number(event.target.value),
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onCook();
              }
            }}
          />
          <Button
            className="h-11 px-4"
            onClick={onCook}
            disabled={hasPendingAction || !canCook}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {isCookPending ? "Cooking" : "Cook"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MaterialImage({
  id,
  name,
  rarity,
}: {
  id: string;
  name: string;
  rarity: number;
}) {
  return (
    <div
      className={cn(
        "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br",
        rarityColorMap[rarity] ?? rarityColorMap[1],
      )}
    >
      <Image
        src={`/api/material-image/${id}`}
        alt={name}
        fill
        className="object-contain p-1.5"
        sizes="48px"
      />
    </div>
  );
}

function buildInventoryDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(
    data.ingredients.map((ingredient) => [ingredient.id, ingredient.quantity]),
  );
}

function buildProgressDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(
    data.recipes.map((recipe) => [recipe.id, recipe.completedCount]),
  );
}

function buildCookDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(data.recipes.map((recipe) => [recipe.id, 1]));
}

function getCookableServings(recipe: CookingRecipeView) {
  if (recipe.ingredients.length === 0) {
    return 0;
  }

  return Math.min(
    ...recipe.ingredients.map((ingredient) =>
      Math.floor(ingredient.owned / Math.max(ingredient.quantity, 1)),
    ),
  );
}

function getCookQuantityLimit(recipe: CookingRecipeView) {
  if (recipe.achievedAuto || recipe.remainingCount <= 0) {
    return 0;
  }

  return Math.min(recipe.remainingCount, getCookableServings(recipe));
}

function getRecipeShortageSummary(recipe: CookingRecipeView) {
  return recipe.ingredients
    .map((ingredient) => {
      const missing = Math.max(ingredient.quantity - ingredient.owned, 0);

      return missing > 0
        ? `${ingredient.name} x${formatNumber(missing)}`
        : null;
    })
    .filter((value): value is string => Boolean(value))
    .slice(0, 3)
    .join(", ");
}

function applyCookingInventoryQuantity(
  data: CookingData,
  materialId: string,
  quantity: number,
): CookingData {
  const ingredients = data.ingredients.map((ingredient) =>
    ingredient.id === materialId
      ? {
          ...ingredient,
          quantity,
          totalCraftable: quantity,
        }
      : ingredient,
  );
  const recipes = data.recipes.map((recipe) => ({
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) =>
      ingredient.materialId === materialId
        ? {
            ...ingredient,
            owned: quantity,
          }
        : ingredient,
    ),
  }));
  const rarityByMaterialId = new Map(
    ingredients.map((ingredient) => [ingredient.id, ingredient.rarity]),
  );
  const neededByMaterial = new Map<string, CookingNeededIngredient>();

  for (const recipe of recipes) {
    if (recipe.achievedAuto) {
      continue;
    }

    for (const ingredient of recipe.ingredients) {
      const existing = neededByMaterial.get(ingredient.materialId);

      if (existing) {
        existing.required += ingredient.needed;
        existing.owned = ingredient.owned;
        existing.remaining = Math.max(existing.required - existing.owned, 0);
      } else {
        neededByMaterial.set(ingredient.materialId, {
          materialId: ingredient.materialId,
          name: ingredient.name,
          image: ingredient.image,
          rarity: rarityByMaterialId.get(ingredient.materialId) ?? 1,
          required: ingredient.needed,
          owned: ingredient.owned,
          remaining: Math.max(ingredient.needed - ingredient.owned, 0),
        });
      }
    }
  }

  const neededIngredients = Array.from(neededByMaterial.values()).sort(
    (left, right) => {
      if (left.remaining !== right.remaining) {
        return right.remaining - left.remaining;
      }

      return left.name.localeCompare(right.name);
    },
  );

  return {
    ...data,
    ingredients,
    recipes,
    neededIngredients,
    stats: {
      ...data.stats,
      neededIngredients: neededIngredients.filter((item) => item.remaining > 0)
        .length,
    },
  };
}

function getRecipeNeededIngredients(
  recipe: CookingRecipeView,
  rarityByMaterialId: Map<string, number>,
) {
  return recipe.ingredients
    .map((ingredient) => ({
      materialId: ingredient.materialId,
      name: ingredient.name,
      image: ingredient.image,
      rarity: rarityByMaterialId.get(ingredient.materialId) ?? 1,
      required: ingredient.needed,
      owned: ingredient.owned,
      remaining: Math.max(ingredient.needed - ingredient.owned, 0),
    }))
    .filter((ingredient) => ingredient.remaining > 0)
    .sort((left, right) => {
      if (left.remaining !== right.remaining) {
        return right.remaining - left.remaining;
      }

      return left.name.localeCompare(right.name);
    });
}
