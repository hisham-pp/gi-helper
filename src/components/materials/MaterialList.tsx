"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Search,
  X,
  LayoutGrid,
  List,
  Filter,
  ArrowLeft,
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
import { MaterialModal } from "./MaterialModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PillDropdown } from "@/components/ui/PillDropdown";

type SortOption =
  | "order-asc"
  | "order-desc"
  | "name-asc"
  | "name-desc"
  | "rarity-desc"
  | "rarity-asc";

const PAGE_SIZE_OPTIONS = [36, 72, 144, 475];

export function MaterialList() {
  const allMaterials = useMemo(() => getAllMaterials(), []);

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
    if (pageSize >= 475) return filteredMaterials;
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

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start bg-transparent p-4 pt-6 md:p-8">
      {/* Top Global Navigation Bar */}
      <div className="mb-8 flex w-full max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Back to Scanner</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/debug"
            className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
          >
            <Bug className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Debugger</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/30 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/20 text-primary">
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
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-sm">
                <span className="text-primary">Total:</span> {stats.total}
              </span>
              {[5, 4, 3, 2, 1].map((r) => {
                const rStyles = getRarityStyles(r);
                return (
                  <button
                    key={r}
                    onClick={() =>
                      setSelectedRarity(selectedRarity === r ? "ALL" : r)
                    }
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedRarity === r
                        ? `${rStyles.badgeBg} scale-105 ring-2 ring-white/30`
                        : "border-white/10 bg-black/30 text-white/70 hover:bg-white/10"
                    }`}
                    title={`Filter by ${r}★ Materials`}
                  >
                    <span>{r}★</span>
                    <span className="text-[10px] text-white/50">
                      ({stats.rarityCounts[r]})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5 shadow-lg backdrop-blur-xl">
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
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder-white/40 shadow-inner backdrop-blur-md transition-all focus:border-primary/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
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
                triggerRadius="rounded-xl"
                label="Sort:"
                icon={<ArrowUpDown className="h-3.5 w-3.5 text-primary" />}
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={[
                  { value: "order-asc",   label: `In-Game Order (#1 → #${stats.total})` },
                  { value: "order-desc",  label: `In-Game Order (#${stats.total} → #1)` },
                  { value: "rarity-desc", label: "Rarity (5★ → 1★)" },
                  { value: "rarity-asc",  label: "Rarity (1★ → 5★)" },
                  { value: "name-asc",    label: "Name (A → Z)" },
                  { value: "name-desc",   label: "Name (Z → A)" },
                ]}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1 shadow-sm backdrop-blur-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  title="Table View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {/* Items Per Page */}
              <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white shadow-sm">
                <span className="text-[11px] text-white/50">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="cursor-pointer bg-transparent font-semibold text-white focus:outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option
                      key={size}
                      value={size}
                      className="bg-slate-900 text-white"
                    >
                      {size === 475 ? "All (475)" : size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 rounded-xl border border-error/30 bg-error/15 px-3 py-2 text-xs font-bold text-error transition hover:bg-error/25"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 pt-1">
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
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border border-primary/50 bg-primary/20 text-primary shadow-sm ring-1 ring-primary/40"
                      : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  title={`${cat.label} (sortRank: ${cat.sortRankRange})`}
                >
                  <span>{cat.shortLabel}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
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
              <span className="rounded-md border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-12 text-center backdrop-blur-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/40">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No materials found</h3>
            <p className="mt-1 max-w-md text-xs text-white/60">
              We couldn&apos;t find any materials matching your search query
              &apos;{search}&apos; or active filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Materials Presentation (Grid or Table) */}
        {totalItems > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {paginatedMaterials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onClick={() => setSelectedMaterial(mat)}
              />
            ))}
          </div>
        )}

        {totalItems > 0 && viewMode === "table" && (
          <MaterialTableView
            materials={paginatedMaterials}
            onSelectMaterial={(mat) => setSelectedMaterial(mat)}
          />
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:flex-row">
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
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
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            validCurrentPage === p
                              ? "bg-primary text-primary-foreground shadow"
                              : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/15"
                          }`}
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
                className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Material Detail Modal */}
      <MaterialModal
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        onNavigateNext={handleNextModal}
        onNavigatePrev={handlePrevModal}
        hasNext={hasNextModal}
        hasPrev={hasPrevModal}
      />
    </div>
  );
}
