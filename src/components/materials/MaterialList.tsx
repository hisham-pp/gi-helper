"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpDown,
  Search,
  LayoutGrid,
  List,
  Filter,
  Bug,
  Sparkles,
  PackageCheck,
  SlidersHorizontal,
} from "lucide-react";
import { MaterialItem } from "@/lib/types";
import {
  bagOrder,
  getMaterialCategoryId,
  getMaterialCategoryLabel,
  MaterialCategory,
  getRarityStyles,
} from "@/lib/material-ui";
import { useMaterialDescriptions } from "@/lib/material-descriptions";
import { MaterialCard } from "./MaterialCard";
import { CategoryFilterPills } from "./CategoryFilterPills";
import { MaterialTableView } from "./MaterialTableView";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { GlassSegmentedControl } from "@/components/ui/GlassSegmentedControl";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import { PillTabs } from "@/components/ui/PillTabs";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useWiggleOnChange } from "@/lib/use-wiggle-on-change";

type SortOption =
  | "order-asc"
  | "order-desc"
  | "name-asc"
  | "name-desc"
  | "rarity-desc"
  | "rarity-asc";

/** Loaded on demand: its code stays out of the page bundle until the page is idle. */
const MaterialModal = dynamic(
  () => import("./MaterialModal").then((m) => m.MaterialModal),
  { ssr: false },
);

const PAGE_SIZE_OPTIONS = [36, 72, 144];
/** Page size that shows every material on one page. */
const SHOW_ALL = Number.MAX_SAFE_INTEGER;

/**
 * The /db/materials page. `materials` comes from the server page without
 * descriptions (most of the catalogs' bytes); they load the first time a
 * search or the detail modal needs them.
 */
export function MaterialList({ materials }: { materials: MaterialItem[] }) {
  const reducedMotion = usePrefersReducedMotion();

  // UI state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategory>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("order-asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [pageSize, setPageSize] = useState<number>(72);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(
    null,
  );

  const descriptions = useMaterialDescriptions(search.trim() !== "" || selectedMaterial !== null);
  const allMaterials = useMemo(
    () =>
      descriptions
        ? materials.map((m) => ({ ...m, description: descriptions[m.id] ?? "" }))
        : materials,
    [materials, descriptions],
  );

  // Fetch the detail modal's code once the page is idle, so the first click opens it instantly
  useEffect(() => {
    const preload = () => {
      import("./MaterialModal").catch(() => {});
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(preload, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(preload, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedRarity, sortBy, pageSize]);

  // Overall counts for category tabs and rarity pills
  const stats = useMemo(() => {
    const total = allMaterials.length;
    // Character Development Items; the modal shows "#order / this" for them
    const developmentTotal = allMaterials.filter((m) => bagOrder(m).tab !== "Materials").length;
    const rarityCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    const categoryCounts: Record<string, number> = {};

    for (const mat of allMaterials) {
      const r = mat.rarity || 1;
      rarityCounts[r] = (rarityCounts[r] || 0) + 1;

      const cat = getMaterialCategoryId(mat);
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    return { total, developmentTotal, rarityCounts, categoryCounts };
  }, [allMaterials]);

  // Filtered & Sorted Materials
  const filteredMaterials = useMemo(() => {
    let result = allMaterials;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)),
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(
        (m) => getMaterialCategoryId(m) === selectedCategory,
      );
    }

    // Rarity filter
    if (selectedRarity !== "ALL") {
      result = result.filter((m) => (m.rarity || 1) === selectedRarity);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "order-asc":
          return a.order - b.order;
        case "order-desc":
          return b.order - a.order;
        case "name-asc":
          return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        case "name-desc":
          return b.name.localeCompare(a.name, "en", { sensitivity: "base" });
        case "rarity-desc":
          return (b.rarity || 1) - (a.rarity || 1) || a.order - b.order;
        case "rarity-asc":
          return (a.rarity || 1) - (b.rarity || 1) || a.order - b.order;
        default:
          return a.order - b.order;
      }
    });

    return result;
  }, [allMaterials, search, selectedCategory, selectedRarity, sortBy]);

  // Pagination calculation
  const totalItems = filteredMaterials.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedMaterials = useMemo(() => {
    if (pageSize === SHOW_ALL) return filteredMaterials;
    const startIdx = (validCurrentPage - 1) * pageSize;
    return filteredMaterials.slice(startIdx, startIdx + pageSize);
  }, [filteredMaterials, validCurrentPage, pageSize]);

  // Modal Next/Prev navigation
  const selectedIndexInFiltered = useMemo(() => {
    if (!selectedMaterial) return -1;
    return filteredMaterials.findIndex((m) => m.id === selectedMaterial.id);
  }, [selectedMaterial, filteredMaterials]);

  const hasNextModal =
    selectedIndexInFiltered >= 0 &&
    selectedIndexInFiltered < filteredMaterials.length - 1;
  const hasPrevModal = selectedIndexInFiltered > 0;

  const handleNextModal = () => {
    if (hasNextModal) {
      setSelectedMaterial(filteredMaterials[selectedIndexInFiltered + 1]);
    }
  };

  const handlePrevModal = () => {
    if (hasPrevModal) {
      setSelectedMaterial(filteredMaterials[selectedIndexInFiltered - 1]);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedRarity("ALL");
    setSortBy("order-asc");
    setCurrentPage(1);
  };

  const isFiltered =
    search.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedRarity !== "ALL" ||
    sortBy !== "order-asc";

  // Small squash-and-stretch feedback, echoing the scanner drop zone when tabs
  // switch: the filter card as the Reset button slides in or out, and the
  // header card when a rarity chip is picked or cleared. (The pagination bar
  // wiggles on page changes by itself.)
  const filterBarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // Also on every category tab change (one trigger, so it plays once)
  useWiggleOnChange(filterBarRef, `${isFiltered}:${selectedCategory}`, reducedMotion);
  useWiggleOnChange(heroRef, selectedRarity, reducedMotion);

  return (
    <>
      {/* Main Container (db/layout.tsx holds the page padding and DatabaseNav) */}
      <div className="w-full space-y-6">
        {/* Hero Header */}
        <div ref={heroRef} className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                  <PackageCheck className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                  Materials Directory
                </h1>
              </div>
              <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
                All {stats.total} materials in in-game inventory order: the
                Character Development Items, then the Materials tab (local
                specialties, cooking ingredients, fish, ores and wood).
              </p>
            </div>

            {/* Quick Stat Badges */}
            {/* Scrolls sideways on phones; the padding (cancelled by negative margins) leaves room for the glow */}
            <div className="no-scrollbar -mx-4 -my-3 flex min-w-0 items-center overflow-x-auto px-4 py-3 sm:mx-0 sm:shrink-0 sm:justify-end sm:overflow-visible sm:px-0">
              <PillTabs<number | "ALL">
                ariaLabel="Rarity"
                value={selectedRarity}
                onChange={setSelectedRarity}
                options={[
                  {
                    value: "ALL",
                    label: <span className={selectedRarity === "ALL" ? "text-white" : "text-cyan-300"}>Total</span>,
                    count: stats.total,
                    title: "All rarities",
                  },
                  ...[5, 4, 3, 2, 1].map((r) => {
                    const rStyles = getRarityStyles(r);
                    return {
                      value: r,
                      // White on the selected tab's rarity-coloured fill
                      label: <span className={selectedRarity === r ? "text-white" : rStyles.starColor}>{r}★</span>,
                      count: stats.rarityCounts[r] || 0,
                      accent: rStyles.accent,
                      title: `Filter by ${r}★ Materials`,
                    };
                  }),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div ref={filterBarRef} className="glass-card glass-card--lg space-y-4 p-5">
          {/* Search, Sort, and View Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search materials by name, ID, or description..."
            />

            {/* Sort & View Mode Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sort Selector */}
              <PillDropdown
                label="Sort:"
                icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={[
                  {
                    value: "order-asc",
                    label: "In-Game Order",
                  },
                  {
                    value: "order-desc",
                    label: "In-Game Order (reversed)",
                  },
                  { value: "rarity-desc", label: "Rarity (5★ → 1★)" },
                  { value: "rarity-asc", label: "Rarity (1★ → 5★)" },
                  { value: "name-asc", label: "Name (A → Z)" },
                  { value: "name-desc", label: "Name (Z → A)" },
                ]}
              />

              {/* View Mode Toggle (sliding glass thumb, like the scanner tabs) */}
              <GlassSegmentedControl
                ariaLabel="View mode"
                compactOnMobile
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: "grid", label: "Grid", title: "Grid View", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                  { value: "table", label: "Table", title: "Table View", icon: <List className="h-3.5 w-3.5" /> },
                ]}
              />

              {/* Items Per Page */}
              <PillDropdown
                label="Show:"
                value={pageSize === SHOW_ALL ? "all" : String(pageSize)}
                onChange={(v) => setPageSize(v === "all" ? SHOW_ALL : Number(v))}
                options={[
                  ...PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) })),
                  { value: "all", label: `All (${stats.total})` },
                ]}
              />

              <ResetFiltersButton visible={isFiltered} onReset={handleResetFilters} />
            </div>
          </div>

          {/* Category Filter Pills */}
          <CategoryFilterPills
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            total={stats.total}
            counts={stats.categoryCounts}
          />
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="font-mono text-white">{totalItems}</strong> of{" "}
              <strong className="font-mono text-white">{stats.total}</strong>{" "}
              materials
            </span>
            {sortBy === "order-asc" && (
              <span className="glass-chip px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
                ✓ Sorted by Canonical In-Game Order
              </span>
            )}
          </div>

          {/* Pagination summary */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-white/60">
              <span>
                Page <strong className="text-white">{validCurrentPage}</strong>{" "}
                of <strong className="text-white">{totalPages}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
            <div className="glass-lens mb-4 h-16 w-16 text-white/50">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No materials found</h3>
            <p className="mt-1 max-w-md text-xs text-white/60">
              We couldn&apos;t find any materials matching your search query
              &apos;{search}&apos; or active filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="glass-btn glass-btn--primary mt-5 px-5 py-2 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Materials Presentation (Grid or Table) */}
        {totalItems > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {paginatedMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onSelect={setSelectedMaterial}
              />
            ))}
          </div>
        )}

        {totalItems > 0 && viewMode === "table" && (
          <MaterialTableView
            materials={paginatedMaterials}
            onSelectMaterial={setSelectedMaterial}
          />
        )}

        {/* Pagination Bar */}
        <PaginationBar
          page={validCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Material Detail Modal (mounted only while a material is selected) */}
      {selectedMaterial && (
        <MaterialModal
          material={
            descriptions
              ? { ...selectedMaterial, description: descriptions[selectedMaterial.id] ?? "" }
              : selectedMaterial
          }
          descriptionPending={!descriptions}
          onClose={() => setSelectedMaterial(null)}
          onNavigateNext={handleNextModal}
          onNavigatePrev={handlePrevModal}
          hasNext={hasNextModal}
          hasPrev={hasPrevModal}
          total={stats.developmentTotal}
        />
      )}
    </>
  );
}
