"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { Backpack, Download, FileUp, Flower2, PackageCheck, Swords, Users } from "lucide-react";
import { toast } from "sonner";
import { LazySendFeedbackModal, preloadSendFeedbackModal } from "@/components/feedback/lazy-modals";
import { PillNav, type PillNavItem } from "@/components/layout/PillNav";
import { markFeedbackAsked, shouldAskForFeedback } from "@/lib/feedback/prompt";
import { downloadGOOD } from "@gi/good";
import type { ImportSummary } from "@gi/good";
import { useGOODInventory } from "@gi/good";
import { LazyImportGOODModal, preloadImportGOODModal } from "./lazy-modals";
import { useHydrated } from "./shared";

const TABS = ["materials", "characters", "weapons", "artifacts"] as const;
type Tab = (typeof TABS)[number];

const TAB_ITEMS: Record<Tab, Omit<PillNavItem, "count">> = {
  materials: { href: "/inventory/materials", label: "Materials", icon: PackageCheck },
  characters: { href: "/inventory/characters", label: "Characters", icon: Users },
  weapons: { href: "/inventory/weapons", label: "Weapons", icon: Swords },
  artifacts: { href: "/inventory/artifacts", label: "Artifacts", icon: Flower2 },
};

interface InventoryActions {
  /** Opens the GOOD import dialog (the tabs' empty states offer it too). */
  openImport: () => void;
}

const InventoryActionsContext = createContext<InventoryActions>({ openImport: () => {} });

export function useInventoryActions(): InventoryActions {
  return useContext(InventoryActionsContext);
}

/**
 * The /inventory section's layout: header with GOOD import and export, links
 * to the four sub-pages (/inventory/materials, /characters, /weapons,
 * /artifacts) with their counts, and the import dialog. It stays mounted while
 * you switch between them, so the links' highlight slides. All of the
 * inventory lives in this browser.
 */
export function InventoryShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const { counts, buildDocument } = useGOODInventory();
  const [importOpen, setImportOpen] = useState(false);
  // Send feedback form, offered after an export
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const tabsRowRef = useRef<HTMLDivElement>(null);

  const currentTab = TABS.find((t) => pathname === TAB_ITEMS[t].href);

  // On phones the links scroll sideways: keep the current one in view
  useEffect(() => {
    const row = tabsRowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active) return;
    const tabBox = active.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    if (tabBox.left < rowBox.left) row.scrollBy({ left: tabBox.left - rowBox.left - 16 });
    else if (tabBox.right > rowBox.right) row.scrollBy({ left: tabBox.right - rowBox.right + 16 });
  }, [pathname]);

  const openImport = useCallback(() => setImportOpen(true), []);
  const actions = useMemo(() => ({ openImport }), [openImport]);

  const handleImported = useCallback(
    (summary: ImportSummary) => {
      const parts = [
        summary.characters && `${summary.characters} characters`,
        summary.weapons && `${summary.weapons} weapons`,
        summary.artifacts && `${summary.artifacts} artifacts`,
        summary.materials + summary.extraMaterials &&
          `${summary.materials + summary.extraMaterials} materials`,
      ].filter(Boolean);
      toast.success("GOOD file imported", { description: parts.join(", ") });
      // Show what came in, unless the open tab got something
      const imported: Record<Tab, number> = {
        materials: summary.materials + summary.extraMaterials,
        characters: summary.characters,
        weapons: summary.weapons,
        artifacts: summary.artifacts,
      };
      if (!currentTab || !imported[currentTab]) {
        const first = TABS.find((t) => imported[t] > 0);
        if (first) router.push(TAB_ITEMS[first].href);
      }
    },
    [currentTab, router],
  );

  const total = counts.materials + counts.characters + counts.weapons + counts.artifacts;

  const handleExport = useCallback(() => {
    if (total === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadGOOD(buildDocument());
    const skipped = counts.artifactsWithoutMainStat;
    const note =
      skipped > 0
        ? `${skipped} scanned artifact${skipped > 1 ? "s" : ""} without a main stat ${skipped > 1 ? "were" : "was"} left out.`
        : undefined;
    if (!shouldAskForFeedback()) {
      toast.success("Exported to GOOD format!", note ? { description: note } : undefined);
      return;
    }
    // Right after an export is a good moment to ask how the scan went
    markFeedbackAsked();
    preloadSendFeedbackModal();
    toast.success("Exported to GOOD format!", {
      description: [note, "How did the scan go? A quick note helps make GI Helper better."].filter(Boolean).join(" "),
      action: { label: "Give feedback", onClick: () => setFeedbackOpen(true) },
      duration: 12000,
    });
  }, [total, buildDocument, counts.artifactsWithoutMainStat]);

  return (
    <InventoryActionsContext.Provider value={actions}>
      <div className="flex w-full flex-1 flex-col items-center justify-start px-4 pb-4 pt-2 sm:px-6 sm:pt-4 md:px-8 md:pb-8">
        <div className="flex w-full max-w-7xl flex-1 flex-col gap-6">
          {/* Hero Header */}
          <div className="glass-card glass-card--lg p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
                    <Backpack className="h-5 w-5" />
                  </span>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
                    Inventory
                  </h1>
                </div>
                <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
                  Your materials, characters, weapons and artifacts, saved in this browser. Scan or
                  import a GOOD file, fix anything, then export to GOOD for your optimizer.
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                <button
                  onClick={openImport}
                  onPointerEnter={preloadImportGOODModal}
                  className="glass-btn flex-1 justify-center whitespace-nowrap px-4 py-2 text-sm sm:flex-none"
                >
                  <FileUp className="h-4 w-4" /> Import .GOOD
                </button>
                {hydrated && total > 0 && (
                  <button
                    onClick={handleExport}
                    className="glass-btn glass-btn--primary flex-1 justify-center whitespace-nowrap px-5 py-2 text-sm sm:flex-none"
                  >
                    <Download className="h-4 w-4" /> Export .GOOD
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrolls sideways on narrow phones instead of widening the page */}
          <div ref={tabsRowRef} className="no-scrollbar -mx-4 -my-3 flex overflow-x-auto px-4 py-3">
            <PillNav
              ariaLabel="Inventory sections"
              // shrink-0: keep its width and let the row scroll, rather than squeeze the labels
              className="inline-grid shrink-0"
              iconClassName="hidden sm:block"
              items={TABS.map((t) => ({
                ...TAB_ITEMS[t],
                href: TAB_ITEMS[t].href as Route,
                count: hydrated ? counts[t] : 0,
              }))}
            />
          </div>

          {children}
        </div>

        {importOpen && (
          <LazyImportGOODModal onClose={() => setImportOpen(false)} onImported={handleImported} />
        )}
        {feedbackOpen && (
          <LazySendFeedbackModal
            onClose={() => setFeedbackOpen(false)}
            onSent={() => setFeedbackOpen(false)}
          />
        )}
      </div>
    </InventoryActionsContext.Provider>
  );
}
