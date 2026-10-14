"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ShellLink } from "@/components/layout/ShellLink";
import {
  ArrowUpDown,
  Backpack,
  Download,
  Scan,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ResultGrid } from "./ResultGrid";
import { LazySendFeedbackModal, preloadSendFeedbackModal } from "@/components/feedback/lazy-modals";
import { CategoryFilterPills } from "@/components/materials/CategoryFilterPills";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { PillDropdown } from "@/components/ui/PillDropdown";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { SearchField } from "@/components/ui/SearchField";
import { useConfirm } from "@/components/ui/use-confirm";
import { markFeedbackAsked, shouldAskForFeedback } from "@/lib/feedback/prompt";
import { exportToGOODFormat } from "@/lib/good-format";
import {
  getAllMaterials,
  getMaterialCategoryId,
  MaterialCategory,
} from "@/lib/materials";
import { useScannerInventory } from "@/lib/scanner-inventory";
import type { DetectedItem, MaterialItem } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useWiggleOnChange } from "@/lib/use-wiggle-on-change";

type SortOption =
  | "order-asc"
  | "order-desc"
  | "qty-desc"
  | "qty-asc"
  | "rarity-desc"
  | "rarity-asc"
  | "name-asc"
  | "name-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "order-asc", label: "In-Game Order" },
  { value: "order-desc", label: "In-Game Order (reversed)" },
  { value: "qty-desc", label: "Quantity (high → low)" },
  { value: "qty-asc", label: "Quantity (low → high)" },
  { value: "rarity-desc", label: "Rarity (5★ → 1★)" },
  { value: "rarity-asc", label: "Rarity (1★ → 5★)" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
];

const PAGE_SIZE_OPTIONS = [36, 72, 144];
/** Page size that shows every item on one page. */
const SHOW_ALL = Number.MAX_SAFE_INTEGER;

/** A scanned item with its catalog entry (for bag order and category). */
interface InventoryEntry {
  item: DetectedItem;
  material?: MaterialItem;
}

const rarityOf = (e: InventoryEntry) =>
  e.item.rarity || e.material?.rarity || 1;
/** Unknown ids (not in the catalog) sort after everything else. */
const orderOf = (e: InventoryEntry) =>
  e.material?.order ?? Number.MAX_SAFE_INTEGER;

const noopSubscribe = () => () => {};

/**
 * The /inventory page: everything the scanners have added (the shared
 * localStorage store), with search, category/rarity filters, sorting and
 * pagination, quantity edits, Clear All and the GOOD export. The scanners
 * switch here once a scan's materials are added.
 */
export function ScannedInventory() {
  const [items, setItems] = useScannerInventory();
  const { confirm, confirmModal } = useConfirm();
  // Send feedback form, offered after an export
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // False on the server and while hydrating, so a saved inventory doesn't flash the empty state first
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const reducedMotion = usePrefersReducedMotion();

  // UI state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategory>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("order-asc");
  const [pageSize, setPageSize] = useState<number>(36);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedRarity, sortBy, pageSize]);

  const materialsById = useMemo(
    () => new Map(getAllMaterials().map((m) => [m.id, m])),
    [],
  );

  const entries = useMemo<InventoryEntry[]>(
    () => items.map((item) => ({ item, material: materialsById.get(item.id) })),
    [items, materialsById],
  );

  // Counts for the category pills and rarity options
  const stats = useMemo(() => {
    const rarityCounts: Record<number, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (const e of entries) {
      const r = rarityOf(e);
      rarityCounts[r] = (rarityCounts[r] || 0) + 1;
      if (e.material) {
        const cat = getMaterialCategoryId(e.material);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }
    return { total: entries.length, rarityCounts, categoryCounts };
  }, [entries]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.item.name.toLowerCase().includes(q) ||
          e.item.id.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (e) =>
          e.material && getMaterialCategoryId(e.material) === selectedCategory,
      );
    }

    if (selectedRarity !== "ALL") {
      result = result.filter((e) => rarityOf(e) === selectedRarity);
    }

    const byName = (a: InventoryEntry, b: InventoryEntry) =>
      a.item.name.localeCompare(b.item.name, "en", { sensitivity: "base" });
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "order-desc":
          return orderOf(b) - orderOf(a);
        case "qty-desc":
          return b.item.quantity - a.item.quantity || orderOf(a) - orderOf(b);
        case "qty-asc":
          return a.item.quantity - b.item.quantity || orderOf(a) - orderOf(b);
        case "rarity-desc":
          return rarityOf(b) - rarityOf(a) || orderOf(a) - orderOf(b);
        case "rarity-asc":
          return rarityOf(a) - rarityOf(b) || orderOf(a) - orderOf(b);
        case "name-asc":
          return byName(a, b);
        case "name-desc":
          return byName(b, a);
        default:
          return orderOf(a) - orderOf(b);
      }
    });

    return result.map((e) => e.item);
  }, [entries, search, selectedCategory, selectedRarity, sortBy]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedItems = useMemo(() => {
    if (pageSize === SHOW_ALL) return filteredItems;
    const startIdx = (validCurrentPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, validCurrentPage, pageSize]);

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

  // The filter card squashes as the Reset button slides in or out, like on /materials
  const filterBarRef = useRef<HTMLDivElement>(null);
  // Also on every category tab change (one trigger, so it plays once)
  useWiggleOnChange(filterBarRef, `${isFiltered}:${selectedCategory}`, reducedMotion);

  // Stable callbacks keep the memoized ResultGrid from re-rendering on unrelated state
  const handleClear = useCallback(async () => {
    const confirmed = await confirm({
      title: "Clear your inventory?",
      message: "Every scanned material is removed from this browser. Export to GOOD first if you want to keep them.",
      confirmLabel: "Clear All",
      tone: "danger",
      icon: Trash2,
    });
    if (!confirmed) return;
    setItems([]);
    toast.success("Items cleared");
  }, [confirm, setItems]);

  const handleExport = useCallback(() => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }
    exportToGOODFormat(items);
    if (!shouldAskForFeedback()) {
      toast.success("Exported to GOOD format!");
      return;
    }
    // Right after an export is a good moment to ask how the scan went
    markFeedbackAsked();
    preloadSendFeedbackModal();
    toast.success("Exported to GOOD format!", {
      description: "How did the scan go? A quick note helps make GI Helper better.",
      action: { label: "Give feedback", onClick: () => setFeedbackOpen(true) },
      duration: 12000,
    });
  }, [items]);

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) =>
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i,
        ),
      ),
    [setItems],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => setItems((prev) => prev.filter((i) => i.id !== itemId)),
    [setItems],
  );

  const hasItems = hydrated && items.length > 0;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
      <div className="w-full max-w-7xl space-y-6">
        {/* Hero Header */}
        <div className="glass-card glass-card--lg p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                  <Backpack className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                  Scanned Inventory
                </h1>
              </div>
              <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
                Everything your scans have added, saved in this browser. Fix any
                quantities, then export to GOOD for your optimizer.
              </p>
            </div>

            {hasItems && (
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                <span className="glass-chip px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                  <span className="text-cyan-300">Items:</span> {items.length}
                </span>
                <button
                  onClick={handleClear}
                  className="glass-btn glass-btn--danger flex-1 justify-center px-4 py-2 text-sm sm:flex-none"
                >
                  <Trash2 className="h-4 w-4" /> Clear All
                </button>
                <button
                  onClick={handleExport}
                  className="glass-btn glass-btn--primary flex-1 justify-center px-5 py-2 text-sm sm:flex-none"
                >
                  <Download className="h-4 w-4" /> Export .GOOD
                </button>
              </div>
            )}
          </div>
        </div>

        {hasItems && (
          <>
            {/* Search, Filters & Sort */}
            <div
              ref={filterBarRef}
              className="glass-card glass-card--lg space-y-4 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Search your inventory by name or ID..."
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <PillDropdown
                    label="Sort:"
                    icon={<ArrowUpDown className="h-3.5 w-3.5 text-cyan-300" />}
                    value={sortBy}
                    onChange={(v) => setSortBy(v as SortOption)}
                    options={SORT_OPTIONS}
                  />

                  <PillDropdown
                    label="Rarity:"
                    icon={<Star className="h-3.5 w-3.5 text-amber-300" />}
                    value={String(selectedRarity)}
                    onChange={(v) =>
                      setSelectedRarity(v === "ALL" ? "ALL" : Number(v))
                    }
                    options={[
                      { value: "ALL", label: `All (${stats.total})` },
                      ...[5, 4, 3, 2, 1].map((r) => ({
                        value: String(r),
                        label: `${r}★ (${stats.rarityCounts[r] || 0})`,
                      })),
                    ]}
                  />

                  <PillDropdown
                    label="Show:"
                    value={pageSize === SHOW_ALL ? "all" : String(pageSize)}
                    onChange={(v) =>
                      setPageSize(v === "all" ? SHOW_ALL : Number(v))
                    }
                    options={[
                      ...PAGE_SIZE_OPTIONS.map((size) => ({
                        value: String(size),
                        label: String(size),
                      })),
                      { value: "all", label: `All (${stats.total})` },
                    ]}
                  />

                  <ResetFiltersButton
                    visible={isFiltered}
                    onReset={handleResetFilters}
                  />
                </div>
              </div>

              {/* Only the categories you have items in */}
              <CategoryFilterPills
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                total={stats.total}
                counts={stats.categoryCounts}
                hideEmpty
              />
            </div>

            {/* Results Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-white/70">
              <span>
                Showing{" "}
                <strong className="font-mono text-white">{totalItems}</strong>{" "}
                of{" "}
                <strong className="font-mono text-white">{stats.total}</strong>{" "}
                materials
              </span>
              {totalPages > 1 && (
                <span className="text-white/60">
                  Page{" "}
                  <strong className="text-white">{validCurrentPage}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong>
                </span>
              )}
            </div>

            {totalItems > 0 ? (
              <ResultGrid
                items={paginatedItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
                <div className="glass-lens mb-4 h-16 w-16 text-white/50">
                  <Search className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Nothing matches these filters
                </h2>
                <p className="mt-1 max-w-md text-xs text-white/60">
                  None of your scanned materials match the search or the
                  selected category and rarity.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="glass-btn glass-btn--primary mt-5 px-5 py-2 text-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            <PaginationBar
              page={validCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {hydrated && items.length === 0 && (
          <div className="glass-card glass-card--lg flex flex-col items-center justify-center p-12 text-center">
            <div className="glass-lens mb-4 h-16 w-16 text-white/50">
              <Backpack className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-white">
              No scanned materials yet
            </h2>
            <p className="mt-1 max-w-md text-xs text-white/60">
              Scan your inventory screenshots or a screen recording; the
              materials you add show up here.
            </p>
            <ShellLink
              href="/"
              className="glass-btn glass-btn--primary mt-5 px-5 py-2 text-xs"
            >
              <Scan className="h-4 w-4" /> Go to the scanner
            </ShellLink>
          </div>
        )}
      </div>

      {confirmModal}
      {feedbackOpen && (
        <LazySendFeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSent={() => setFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
