"use client";

import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ScannedReviewItem,
  DetectedItem,
  EquipmentReviewItem,
  ReviewCandidate,
  MaterialItem,
} from "@/lib/types";
import {
  CheckCircle2,
  Trash2,
  X,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Sparkles,
  Search,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getRarityStyles } from "@/lib/materials/ui";
import { GlassInput } from "@/components/ui/GlassInput";
import { MaterialThumb } from "@/components/ui/MaterialThumb";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";
import { useOwnedArtifacts, useOwnedWeapons } from "@/lib/good/inventory";
import { fixedMainStat, splitArtifactItem } from "@/lib/scanner/equipment";
import { MAIN_STATS_BY_SLOT } from "@/lib/good/types";
import { EquipmentReviewRow } from "./EquipmentReviewRow";
import { equipmentName, type EquipmentConfirm } from "./equipment-review";
import type { EquipmentOption } from "./EquipmentPickerModal";

const loadMaterialPicker = () => import("./MaterialPickerModal");
const loadEquipmentPicker = () => import("./EquipmentPickerModal");

/** Loaded on demand: most reviews are confirmed without opening it. */
const MaterialPickerModal = dynamic(
  () => import("./MaterialPickerModal").then((m) => m.MaterialPickerModal),
  { ssr: false },
);
const EquipmentPickerModal = dynamic(
  () => import("./EquipmentPickerModal").then((m) => m.EquipmentPickerModal),
  { ssr: false },
);

interface ScanReviewModalProps {
  reviewItems: ScannedReviewItem[];
  /** Weapons and artifacts read in the same scan. */
  equipment?: EquipmentReviewItem[];
  onClose: () => void;
  onConfirm: (
    confirmedItems: DetectedItem[],
    equipment?: EquipmentConfirm,
  ) => void;
}

type ReviewView = "materials" | "weapon" | "artifact" | "character";

const VIEW_LABELS: Record<ReviewView, string> = {
  materials: "Materials",
  weapon: "Weapons",
  artifact: "Artifacts",
  character: "Characters",
};

/**
 * Post-scan review. The parent mounts it only while open (via
 * LazyScanReviewModal), so its state always starts from the latest scan.
 */
export function ScanReviewModal({
  reviewItems,
  equipment = [],
  onClose,
  onConfirm,
}: ScanReviewModalProps) {
  const [items, setItems] = useState<ScannedReviewItem[]>(reviewItems);
  const [equip, setEquip] = useState<EquipmentReviewItem[]>(equipment);
  const [searchQuery, setSearchQuery] = useState("");
  // A scan of the Weapons or Artifacts tab is a snapshot of it, like a GOOD file
  const [replace, setReplace] = useState<EquipmentConfirm["replace"]>({
    weapon: true,
    artifact: true,
    character: false,
  });
  const [ownedWeapons] = useOwnedWeapons();
  const [ownedArtifacts] = useOwnedArtifacts();

  const views = useMemo(() => {
    const list: ReviewView[] = [];
    if (reviewItems.length > 0 || equipment.length === 0)
      list.push("materials");
    if (equipment.some((e) => e.kind === "weapon")) list.push("weapon");
    if (equipment.some((e) => e.kind === "artifact")) list.push("artifact");
    if (equipment.some((e) => e.kind === "character")) list.push("character");
    return list;
  }, [reviewItems, equipment]);
  const [view, setView] = useState<ReviewView>(views[0]);

  // Material Picker Sub-modal state
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingEquipId, setEditingEquipId] = useState<string | null>(null);

  usePauseBackground();
  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);

  // Fetch the picker's chunk while the user reads the list, so "Change" opens instantly
  useEffect(() => {
    if (reviewItems.length > 0) loadMaterialPicker().catch(() => {});
    if (equipment.length > 0) loadEquipmentPicker().catch(() => {});
  }, [reviewItems.length, equipment.length]);

  const handleEquipChange = useCallback(
    (id: string, patch: Partial<EquipmentReviewItem>) => {
      setEquip((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
    },
    [],
  );

  const handleEquipRemove = useCallback((id: string) => {
    setEquip((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** Reassigns a row to another weapon or piece; an artifact keeps its main stat if the new slot allows it. */
  const handleEquipSelect = useCallback(
    (id: string, choice: ReviewCandidate | EquipmentOption) => {
      setEquip((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const next: EquipmentReviewItem = {
            ...e,
            item: choice.id,
            name: equipmentName(e.kind, choice.id),
            rarity: e.rarity ?? choice.rarity,
            variant: undefined,
            reviewReason: undefined,
          };
          if (e.kind === "artifact") {
            const slot = splitArtifactItem(choice.id).slot;
            const allowed = MAIN_STATS_BY_SLOT[slot] as readonly string[];
            next.mainStatKey =
              fixedMainStat(slot) ??
              (allowed.includes(e.mainStatKey) ? e.mainStatKey : "");
          }
          return next;
        }),
      );
      setEditingEquipId(null);
    },
    [],
  );

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  }, []);

  const handleSetQuantity = useCallback((id: string, qty: number) => {
    const safeQty = Math.max(1, isNaN(qty) ? 1 : qty);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: safeQty } : item,
      ),
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSelectMaterial = useCallback(
    (slotId: string, material: MaterialItem | ReviewCandidate) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === slotId) {
            return {
              ...item,
              materialId: material.id,
              name: material.name,
              rarity: material.rarity,
            };
          }
          return item;
        }),
      );
      setEditingSlotId(null);
      toast.success(`Assigned ${material.name}`);
    },
    [],
  );

  const handleClosePicker = useCallback(() => setEditingSlotId(null), []);

  const handleConfirm = () => {
    if (items.length === 0 && equip.length === 0) {
      toast.info("No items to add.");
      close();
      return;
    }

    // Aggregate duplicates across items into final DetectedItem[]
    const aggregatedMap = new Map<string, DetectedItem>();

    for (const item of items) {
      if (aggregatedMap.has(item.materialId)) {
        aggregatedMap.get(item.materialId)!.quantity += item.quantity;
      } else {
        aggregatedMap.set(item.materialId, {
          id: item.materialId,
          name: item.name,
          quantity: item.quantity,
          rarity: item.rarity,
        });
      }
    }

    const finalItems = Array.from(aggregatedMap.values());
    const confirmed = equip.length > 0 ? { items: equip, replace } : undefined;
    // The parent unmounts the modal on confirm, so hand the items over once it has closed
    closeThen(() => onConfirm(finalItems, confirmed));
    const parts = [
      finalItems.length > 0 &&
        `${finalItems.length} material${finalItems.length === 1 ? "" : "s"}`,
      ...(["weapon", "artifact", "character"] as const).map((k) => {
        const n = equip.filter((e) => e.kind === k && e.item).length;
        return n > 0 && `${n} ${k}${n === 1 ? "" : "s"}`;
      }),
    ].filter(Boolean);
    toast.success(`Confirmed ${parts.join(", ")}.`);
  };

  // Typing in the search box stays responsive; the list catches up in a background render
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(deferredQuery.toLowerCase()),
      ),
    [items, deferredQuery],
  );

  const viewEquip = useMemo(
    () =>
      equip.filter(
        (e) =>
          e.kind === view &&
          e.name.toLowerCase().includes(deferredQuery.toLowerCase()),
      ),
    [equip, view, deferredQuery],
  );

  const weaponsWithoutPanel = useMemo(
    () =>
      viewEquip.filter(
        (e) => e.kind === "weapon" && !e.fromPanel,
      ),
    [viewEquip],
  );

  const handleBulkSetRefinement = useCallback(
    (rank: number) => {
      const targetIds = new Set(weaponsWithoutPanel.map((w) => w.id));
      if (targetIds.size === 0) return;
      setEquip((prev) =>
        prev.map((e) =>
          targetIds.has(e.id) ? { ...e, refinement: rank } : e,
        ),
      );
      haptics.selection();
      toast.success(
        `Set ${targetIds.size} weapon${targetIds.size === 1 ? "" : "s"} without detail panel to R${rank}.`,
      );
    },
    [weaponsWithoutPanel],
  );

  const countOf = (v: ReviewView) =>
    v === "materials" ? items.length : equip.filter((e) => e.kind === v).length;

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const editingItem = editingSlotId
    ? items.find((it) => it.id === editingSlotId)
    : undefined;
  const editingEquip = editingEquipId
    ? equip.find((e) => e.id === editingEquipId)
    : undefined;
  const ownedCount = {
    weapon: ownedWeapons.length,
    artifact: ownedArtifacts.length,
  };

  // Portal to <body>: an ancestor's transform/filter (e.g. the tab panel's entry
  // animation) would otherwise trap the fixed overlay and the glass blur inside it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300"
        onClick={close}
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="glass-chip h-10 w-10 justify-center rounded-xl text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
                Review Scan Results
              </h2>
              <p className="text-xs text-white/60">
                Compare each card from your screenshots with what it was matched
                to, fix any mistakes, and adjust the numbers.
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="glass-icon-btn h-9 w-9 rounded-full"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-3">
          <GlassInput
            placeholder="Search detected items..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            enterKeyHint="search"
            icon={Search}
            clearable
            shape="pill"
            size="sm"
            className="min-w-[200px] max-w-sm flex-1"
          />

          {views.length > 1 && (
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Kind of item"
            >
              {views.map((v) => (
                <button
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => {
                    if (view !== v) {
                      haptics.selection();
                    }
                    setView(v);
                  }}
                  className="glass-chip px-3 py-1 text-xs font-semibold"
                >
                  {VIEW_LABELS[v]} ({countOf(v)})
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs">
            <span className="glass-chip px-3 py-1 font-semibold text-white/85">
              {countOf(view)} detected slots
            </span>
            {view === "materials" && (
              <span className="glass-chip px-3 py-1 font-semibold text-cyan-200">
                Total Qty: {totalQuantity}
              </span>
            )}
          </div>
        </div>

        {/* Items List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {view !== "materials" ? (
            viewEquip.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/50">
                {countOf(view) === 0 ? (
                  "All items were removed"
                ) : (
                  <>No items matching &ldquo;{searchQuery}&rdquo;</>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {view === "weapon" && weaponsWithoutPanel.length > 0 && (
                  <div className="glass-card flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/5 p-3 sm:px-4 sm:py-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-300" />
                      <span className="text-xs text-white/80">
                        Bulk-set refinement for{" "}
                        <span className="font-semibold text-white">
                          {weaponsWithoutPanel.length}
                        </span>{" "}
                        weapon{weaponsWithoutPanel.length === 1 ? "" : "s"} without detail panel:
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      role="group"
                      aria-label="Bulk set refinement rank"
                    >
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleBulkSetRefinement(r)}
                          className="glass-chip px-2.5 py-1 text-xs font-bold text-white transition hover:bg-white/20 hover:text-cyan-200 active:scale-95"
                          title={`Set ${weaponsWithoutPanel.length} weapon${weaponsWithoutPanel.length === 1 ? "" : "s"} to R${r}`}
                        >
                          R{r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {view === "artifact" &&
                  viewEquip.some((e) => e.mainStatKey === "") && (
                    <p className="glass-chip w-full justify-center bg-amber-400/10 px-3 py-1.5 text-center text-[11px] text-amber-100">
                      The bag only shows the main stat of flowers and plumes;
                      the rest comes from the detail panel of the selected
                      artifact. Pick it here, or record yourself tapping through
                      your artifacts to read every panel.
                    </p>
                  )}
                {viewEquip.map((e) => (
                  <EquipmentReviewRow
                    key={e.id}
                    item={e}
                    onEdit={setEditingEquipId}
                    onSelect={handleEquipSelect}
                    onChange={handleEquipChange}
                    onRemove={handleEquipRemove}
                  />
                ))}
              </div>
            )
          ) : items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-white/60">
              <Sparkles className="mb-2 h-8 w-8 text-white/30" />
              <p className="text-sm font-semibold">All items were removed</p>
              <p className="text-xs text-white/40">
                You can close this window or scan again.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/50">
              No items matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <ReviewRow
                  key={item.id}
                  item={item}
                  onEdit={setEditingSlotId}
                  onSelectMaterial={handleSelectMaterial}
                  onUpdateQuantity={handleUpdateQuantity}
                  onSetQuantity={handleSetQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button onClick={close} className="glass-btn px-5 py-2 text-sm">
            Discard
          </button>
          {(["weapon", "artifact"] as const)
            .filter((k) => ownedCount[k] > 0 && equip.some((e) => e.kind === k))
            .map((k) => (
              <label
                key={k}
                className="flex items-center gap-2 text-[11px] text-white/70"
              >
                <input
                  type="checkbox"
                  checked={replace[k]}
                  onChange={(ev) =>
                    setReplace((prev) => ({ ...prev, [k]: ev.target.checked }))
                  }
                  className="h-3.5 w-3.5 accent-teal-400"
                />
                Replace the {ownedCount[k]} {k}s in my inventory
              </label>
            ))}
          <button
            onClick={handleConfirm}
            disabled={items.length === 0 && equip.length === 0}
            className="glass-btn glass-btn--primary px-6 py-2.5 text-sm font-bold"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Confirm & Add to Inventory</span>
          </button>
        </div>
      </div>

      {/* Material Picker Sub-Modal */}
      {editingItem && (
        <MaterialPickerModal
          item={editingItem}
          onSelect={handleSelectMaterial}
          onClose={handleClosePicker}
        />
      )}
      {editingEquip && (
        <EquipmentPickerModal
          item={editingEquip}
          onSelect={handleEquipSelect}
          onClose={() => setEditingEquipId(null)}
        />
      )}
    </div>,
    document.body,
  );
}

interface ReviewRowProps {
  item: ScannedReviewItem;
  onEdit: (slotId: string) => void;
  onSelectMaterial: (slotId: string, material: ReviewCandidate) => void;
  onUpdateQuantity: (slotId: string, delta: number) => void;
  onSetQuantity: (slotId: string, qty: number) => void;
  onRemove: (slotId: string) => void;
}

/** One review slot. Memoized: editing one slot re-renders only that row. */
const ReviewRow = memo(function ReviewRow({
  item,
  onEdit,
  onSelectMaterial,
  onUpdateQuantity,
  onSetQuantity,
  onRemove,
}: ReviewRowProps) {
  const rarityStyles = getRarityStyles(item.rarity || 1);
  const suggestions =
    item.candidates?.filter((c) => c.id !== item.materialId) ?? [];

  return (
    <div
      // Rarity colour tints the row's glass rim and edge glow
      style={{ "--glass-accent": rarityStyles.accent } as React.CSSProperties}
      className="glass-card flex flex-col items-start justify-between gap-4 p-3 sm:flex-row sm:items-center sm:p-4"
    >
      {/* Left: Image Part (Screenshot Crop) */}
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <div className="glass-well relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          {item.imageSnippet ? (
            <img
              src={item.imageSnippet}
              alt="Screenshot crop"
              decoding="async"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-white/40">No Crop</span>
          )}
          <span className="absolute top-1 left-1 rounded bg-black/40 px-1 py-0.5 text-[8px] font-medium tracking-wide text-white/60">
            Raw
          </span>
        </div>

        <div className="space-y-0.5 text-left">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
            Detected Crop
          </span>
          <span className="block max-w-[140px] truncate text-xs text-white/70">
            {item.sourceImageName}
          </span>
          {item.row !== undefined && item.col !== undefined && (
            <span className="text-[10px] text-white/40">
              R{item.row + 1} : C{item.col + 1}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Arrow indicator */}
      <div className="hidden text-white/30 sm:flex">
        <ArrowRight className="h-4 w-4" />
      </div>

      {/* Right: Matched Material Result & Suggestions */}
      <div className="flex w-full flex-1 flex-col gap-2 sm:w-auto">
        <div className="flex items-center gap-3">
          <div className="glass-well glass-well--tinted relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl">
            <MaterialThumb
              id={item.materialId}
              alt={item.name}
              size={44}
              className="h-11 w-11"
              fallback={
                <span className="text-[10px] text-white/40">No Img</span>
              }
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {item.name}
              </span>
              <button
                onClick={() => onEdit(item.id)}
                className="glass-chip gap-1 px-2.5 py-0.5 text-[11px] font-medium"
                title="Select a different material for this slot"
              >
                <Pencil className="h-3 w-3" />
                <span>Change</span>
              </button>
              {item.reviewReason && (
                <span
                  className="glass-chip gap-1 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200"
                  title="The scanner was not sure about this slot"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {item.reviewReason}
                </span>
              )}
            </div>

            {item.rarity && item.rarity >= 1 ? (
              <div
                className={`flex items-center gap-0.5 text-[11px] font-bold ${rarityStyles.starColor}`}
              >
                {Array.from({ length: item.rarity }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-white/40">Common</span>
            )}
          </div>
        </div>

        {/* Candidate Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-semibold text-white/40">
              Suggestions:
            </span>
            {suggestions.slice(0, 3).map((cand) => (
              <button
                key={cand.id}
                onClick={() => onSelectMaterial(item.id, cand)}
                className="glass-chip gap-1.5 px-2.5 py-0.5 text-[10px]"
                title={`Switch to ${cand.name} (${cand.confidence}%)`}
              >
                <span className="max-w-[130px] truncate">{cand.name}</span>
                <span className="font-mono text-[9px] font-semibold text-cyan-300">
                  {cand.confidence}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Adjustment Controls & Remove Button */}
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <div className="glass-well flex items-center rounded-full p-1">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
            className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            title="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              onSetQuantity(item.id, parseInt(e.target.value) || 1)
            }
            className="w-14 bg-transparent text-center text-sm font-bold text-cyan-100 outline-none"
          />
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="glass-icon-btn h-9 w-9 rounded-xl text-white/50 hover:bg-rose-500/20 hover:text-rose-300"
          title="Remove item from batch"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
