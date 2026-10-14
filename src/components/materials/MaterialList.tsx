"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpDown,
  Search,
  X,
  LayoutGrid,
  List,
  Filter,
  Bug,
  Sparkles,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { MaterialItem } from "@/lib/types";
import {
  getAllMaterials,
  getMaterialCategoryId,
  getMaterialCategoryLabel,
  MATERIAL_CATEGORIES,
  MaterialCategory,
  getRarityStyles,
} from "@/lib/materials";
import { MaterialCard } from "./MaterialCard";
import { MaterialTableView } from "./MaterialTableView";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { GlassSegmentedControl } from "@/components/ui/GlassSegmentedControl";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

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

/**
 * Reset button entrance/exit: the width eases open (so the search box slides
 * aside instead of jumping) while the button pops in with the same springy
 * overshoot as the tab thumbs. Hover transitions of .glass-btn are kept.
 */
const RESET_TRANSITION = [
  "max-width 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "padding 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "margin 380ms cubic-bezier(0.22, 1, 0.36, 1)",
  "opacity 220ms ease",
  "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  "background 200ms ease",
  "color 200ms ease",
  "box-shadow 200ms ease",
].join(", ");

/** Plays a small squash-and-stretch on `ref` whenever `trigger` changes (not on mount). */
function useWiggleOnChange(
  ref: React.RefObject<HTMLElement | null>,
  trigger: unknown,
  reducedMotion: boolean,
) {
  const prevRef = useRef(trigger);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = trigger;
    if (prev === trigger || reducedMotion) return;

    ref.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.006 0.985", offset: 0.35 },
        { scale: "0.998 1.006", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [ref, trigger, reducedMotion]);
}

const PAGE_SIZE_OPTIONS = [36, 72, 144];
/** Page size that shows every material on one page. */
const SHOW_ALL = Number.MAX_SAFE_INTEGER;

export function MaterialList() {
  const allMaterials = useMemo(() => getAllMaterials(), []);

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

    return { total, rarityCounts, categoryCounts };
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
  // switch: the filter card as the Reset button slides in or out, the header
  // card when a rarity chip is picked or cleared, and the pagination bar when
  // the page changes.
  const filterBarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  useWiggleOnChange(filterBarRef, isFiltered, reducedMotion);
  useWiggleOnChange(heroRef, selectedRarity, reducedMotion);
  useWiggleOnChange(paginationRef, validCurrentPage, reducedMotion);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      {/* Main Container */}
      <div className="w-full max-w-7xl space-y-6">
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
                Canonical in-game inventory list of all {stats.total} materials
                in our application, strictly ordered from #1 to #{stats.total}{" "}
                according to Genshin Impact&apos;s inventory algorithm.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="glass-chip px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                <span className="text-cyan-300">Total:</span> {stats.total}
              </span>
              {[5, 4, 3, 2, 1].map((r) => {
                const rStyles = getRarityStyles(r);
                const isSelected = selectedRarity === r;
                return (
                  <button
                    key={r}
                    onClick={() =>
                      setSelectedRarity(isSelected ? "ALL" : r)
                    }
                    aria-pressed={isSelected}
                    style={{ "--glass-accent": rStyles.accent } as React.CSSProperties}
                    className="glass-chip glass-chip--fill gap-1 px-2.5 py-1 text-xs font-bold"
                    title={`Filter by ${r}★ Materials`}
                  >
                    {/* White on the selected chip's rarity-coloured fill */}
                    <span className={isSelected ? "text-white" : rStyles.starColor}>{r}★</span>
                    <span className={`text-[10px] ${isSelected ? "text-white/85" : "text-white/50"}`}>
                      ({stats.rarityCounts[r]})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div ref={filterBarRef} className="glass-card glass-card--lg space-y-4 p-5">
          {/* Search, Sort, and View Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials by name, ID, or description..."
                className="glass-input w-full rounded-full py-2.5 pl-10 pr-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="glass-icon-btn absolute right-2.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

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
                    label: `In-Game Order (#1 → #${stats.total})`,
                  },
                  {
                    value: "order-desc",
                    label: `In-Game Order (#${stats.total} → #1)`,
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

              {/* Reset Filters: always mounted so it can animate in and out
                  (collapsed to zero width, and inert, while nothing is filtered) */}
              <button
                onClick={handleResetFilters}
                inert={!isFiltered}
                aria-hidden={!isFiltered}
                style={{
                  transition: reducedMotion ? "none" : RESET_TRANSITION,
                  // Cancels the row's gap-2.5 while collapsed
                  marginLeft: isFiltered ? 0 : "-0.625rem",
                }}
                className={`glass-btn glass-btn--danger shrink-0 gap-1 overflow-hidden whitespace-nowrap py-2 text-xs ${
                  isFiltered
                    ? "max-w-[7rem] scale-100 px-3 opacity-100"
                    : "pointer-events-none max-w-0 scale-75 px-0 opacity-0"
                }`}
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {/* A horizontal scroller also clips vertically: its padding (cancelled by
              negative margins) leaves room for the selected chip's glow. The
              wrapper takes the card's space-y margin, so those can collapse. */}
          <div>
            <div className="no-scrollbar -mx-4 -my-3 flex items-center gap-2 overflow-x-auto px-4 py-5">
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Category:
              </span>
              {MATERIAL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count =
                  cat.id === "ALL"
                    ? stats.total
                    : stats.categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={isSelected}
                    // Explicit accent: the card's pale cyan would make the fill read as white
                    style={{ "--glass-accent": "34, 211, 238" } as React.CSSProperties}
                    className="glass-chip glass-chip--fill shrink-0 px-3 py-1.5 text-xs font-semibold"
                    title={`${cat.label} (sortRank: ${cat.sortRankRange})`}
                  >
                    <span>{cat.shortLabel}</span>
                    <span
                      className={`rounded-full px-1.5 text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
        {totalPages > 1 && (
          <div
            ref={paginationRef}
            className="glass-card flex flex-col items-center justify-between gap-4 p-4 sm:flex-row"
          >
            <span className="text-xs text-white/60">
              Showing{" "}
              <strong className="text-white">
                {(validCurrentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-white">
                {Math.min(validCurrentPage * pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-white">{totalItems}</strong>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="glass-chip h-8 gap-1 px-3 text-xs font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - validCurrentPage) <= 2;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-xs text-white/40">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          aria-current={validCurrentPage === p ? "page" : undefined}
                          data-active={validCurrentPage === p}
                          className="glass-chip h-8 w-8 justify-center text-xs font-bold"
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={validCurrentPage >= totalPages}
                className="glass-chip h-8 gap-1 px-3 text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Material Detail Modal (mounted only while a material is selected) */}
      {selectedMaterial && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onNavigateNext={handleNextModal}
          onNavigatePrev={handlePrevModal}
          hasNext={hasNextModal}
          hasPrev={hasPrevModal}
          total={stats.total}
        />
      )}
    </div>
  );
}
