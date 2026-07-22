"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Check, ChefHat, Flame, Save, Search, Star } from "lucide-react";
import { toast } from "sonner";

import { cookRecipeAction, saveCookingProgressAction, setRecipeOwnershipAction } from "@/app/actions";
import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import AppTextField from "@/components/core/app-textfield";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CachedImage } from "@/components/ui/cached-image";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/core/app-select";
import { rarityBorderMap, rarityColorMap } from "@/lib/constants";
import type { CookingData, CookingRecipeView } from "@/lib/cooking-data";
import { cn, formatNumber } from "@/lib/utils";

type CookingStatusFilter =
  | "All"
  | "Needs cooking"
  | "Ready to cook"
  | "Missing ingredients"
  | "Auto unlocked"
  | "Owned";
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<CookingStatusFilter>("Owned");
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
        (recipe.achievedAuto || !hasIngredientShortage(recipe))
      ) {
        return false;
      }

      if (statusFilter === "Owned" && !recipe.owned) {
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
      toast.error("This recipe cannot be cooked further.");
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

  function handleToggleOwned(recipeId: string) {
    if (!canPersist) {
      setShowLoginPrompt(true);
      return;
    }

    const recipe = data.recipes.find((item) => item.id === recipeId);
    if (!recipe) {
      return;
    }

    const pendingKey = `owned:${recipeId}`;
    setPendingAction(pendingKey);
    startTransition(async () => {
      try {
        const result = await setRecipeOwnershipAction({
          recipeId,
          owned: !recipe.owned,
        });

        if (!result.success || !result.data) {
          toast.error(result.error ?? "Unable to update recipe ownership.");
          return;
        }

        syncCooking(result.data);
        toast.success(
          recipe.owned
            ? "Recipe marked as not owned."
            : "Recipe marked as owned.",
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
            onToggleOwned={handleToggleOwned}
          />
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
      <Card variant="outlined" className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded bg-surface-variant/40"
            />
          ))}
        </div>
      </Card>
      <Card variant="outlined" className="p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
  onToggleOwned,
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
  onToggleOwned: (recipeId: string) => void;
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
                "Owned",
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
              isOwnedPending={pendingAction === `owned:${recipe.id}`}
              pendingAction={pendingAction}
              progressValue={progressDraft[recipe.id] ?? 0}
              recipe={recipe}
              setCookDraft={setCookDraft}
              setProgressDraft={setProgressDraft}
              onCook={() => onCook(recipe.id)}
              onSave={() => onSave(recipe.id)}
              onToggleOwned={() => onToggleOwned(recipe.id)}
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
  isOwnedPending,
  pendingAction,
  progressValue,
  recipe,
  setCookDraft,
  setProgressDraft,
  onCook,
  onSave,
  onToggleOwned,
}: {
  cookValue: number;
  isCookPending: boolean;
  isProgressPending: boolean;
  isOwnedPending: boolean;
  pendingAction: string | null;
  progressValue: number;
  recipe: CookingRecipeView;
  setCookDraft: Dispatch<SetStateAction<QuantityDraft>>;
  setProgressDraft: Dispatch<SetStateAction<QuantityDraft>>;
  onCook: () => void;
  onSave: () => void;
  onToggleOwned: () => void;
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
          <CachedImage
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
            <div className="flex items-center gap-2">
              <Button
                variant={recipe.owned ? "filled" : "outlined"}
                className={cn(
                  "h-8 px-3",
                  recipe.owned
                    ? "bg-primary text-on-primary-container hover:bg-primary/90"
                    : "text-outline hover:text-primary",
                )}
                onClick={onToggleOwned}
                disabled={isOwnedPending || hasPendingAction}
              >
                <Star
                  className={cn(
                    "h-4 w-4 mr-1.5",
                    recipe.owned ? "fill-current" : "",
                  )}
                />
                <span className="text-xs font-medium">
                  {recipe.owned ? "Owned" : "Mark Owned"}
                </span>
              </Button>
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

      {!recipe.achievedAuto && shortageSummary ? (
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

function buildProgressDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(
    data.recipes.map((recipe) => [recipe.id, recipe.completedCount]),
  );
}

function buildCookDraft(data: CookingData): QuantityDraft {
  return Object.fromEntries(data.recipes.map((recipe) => [recipe.id, 1]));
}

function getCookQuantityLimit(recipe: CookingRecipeView) {
  if (recipe.achievedAuto || recipe.remainingCount <= 0) {
    return 0;
  }

  return recipe.remainingCount;
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

function hasIngredientShortage(recipe: CookingRecipeView) {
  return recipe.ingredients.some(
    (ingredient) => ingredient.owned < ingredient.quantity,
  );
}
