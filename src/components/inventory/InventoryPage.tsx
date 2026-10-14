"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Backpack, Download, FileUp } from "lucide-react";
import { toast } from "sonner";
import { LazySendFeedbackModal, preloadSendFeedbackModal } from "@/components/feedback/lazy-modals";
import { ScannedInventory } from "@/components/scanner/ScannedInventory";
import { PillTabs } from "@/components/ui/PillTabs";
import { markFeedbackAsked, shouldAskForFeedback } from "@/lib/feedback/prompt";
import { downloadGOOD } from "@/lib/good-format";
import type { ImportSummary } from "@/lib/good-import";
import { useGOODInventory } from "@/lib/good-inventory";
import { ArtifactsInventory } from "./ArtifactsInventory";
import { CharactersInventory } from "./CharactersInventory";
import { LazyImportGOODModal, preloadImportGOODModal } from "./lazy-modals";
import { useHydrated } from "./shared";
import { WeaponsInventory } from "./WeaponsInventory";

const TABS = ["materials", "characters", "weapons", "artifacts"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  materials: "Materials",
  characters: "Characters",
  weapons: "Weapons",
  artifacts: "Artifacts",
};

const TAB_ACCENTS: Record<Tab, string> = {
  materials: "34, 211, 238",
  characters: "251, 191, 36",
  weapons: "192, 132, 252",
  artifacts: "52, 211, 153",
};

const isTab = (value: string | null): value is Tab => TABS.includes(value as Tab);

/**
 * The /inventory page: materials, characters, weapons and artifacts, each
 * in its own tab (the open tab is in the URL, ?tab=weapons), with GOOD
 * import and export for everything. All of it lives in this browser.
 */
export function InventoryPage() {
  const hydrated = useHydrated();
  const { counts, buildDocument } = useGOODInventory();
  const [tab, setTab] = useState<Tab>("materials");
  const [importOpen, setImportOpen] = useState(false);
  // Send feedback form, offered after an export
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const tabsRowRef = useRef<HTMLDivElement>(null);

  // Open the tab a link asked for (after hydration: the page is static)
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (isTab(requested)) setTab(requested);
  }, []);

  // On phones the tab row scrolls sideways: keep the open tab in view
  useEffect(() => {
    const row = tabsRowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !active) return;
    const tabBox = active.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    if (tabBox.left < rowBox.left) row.scrollBy({ left: tabBox.left - rowBox.left - 16 });
    else if (tabBox.right > rowBox.right) row.scrollBy({ left: tabBox.right - rowBox.right + 16 });
  }, [tab]);

  const changeTab = useCallback((next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "materials") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }, []);

  const openImport = useCallback(() => setImportOpen(true), []);

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
      if (!imported[tab]) {
        const first = TABS.find((t) => imported[t] > 0);
        if (first) changeTab(first);
      }
    },
    [tab, changeTab],
  );

  const total = counts.materials + counts.characters + counts.weapons + counts.artifacts;

  const handleExport = useCallback(() => {
    if (total === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadGOOD(buildDocument());
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
  }, [total, buildDocument]);

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
          <PillTabs
            ariaLabel="Inventory sections"
            value={tab}
            onChange={changeTab}
            options={TABS.map((t) => ({
              value: t,
              label: TAB_LABELS[t],
              count: hydrated ? counts[t] : 0,
              accent: TAB_ACCENTS[t],
            }))}
          />
        </div>

        {hydrated && tab === "materials" && <ScannedInventory onImport={openImport} />}
        {hydrated && tab === "characters" && <CharactersInventory onImport={openImport} />}
        {hydrated && tab === "weapons" && <WeaponsInventory onImport={openImport} />}
        {hydrated && tab === "artifacts" && <ArtifactsInventory onImport={openImport} />}
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
  );
}
