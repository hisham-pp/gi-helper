"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Bell, PanelTop, Sparkles, type LucideIcon } from "lucide-react";
import { getAllMaterials, materialThumbUrl } from "@/lib/materials";
import type { ScannedReviewItem } from "@/lib/types";
import {
  LazyScanReviewModal,
  LazyScannerSettingsModal,
} from "@/components/scanner/lazy-modals";

const MaterialModal = dynamic(
  () =>
    import("@/components/materials/MaterialModal").then((m) => m.MaterialModal),
  { ssr: false },
);

type OpenModal = "material" | "settings" | "review" | null;

/** Materials picked for the sample review, spread across the bag order. */
const SAMPLE_INDEXES = [0, 7, 23, 61, 118, 204];
const SAMPLE_QUANTITIES = [12, 340, 5, 1260, 48, 7];

/**
 * Triggers for the app's toasts and modals, to check their glass and
 * squash-and-stretch without running a scan.
 */
export function MotionPlayground() {
  const materials = useMemo(() => getAllMaterials(), []);
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [materialIndex, setMaterialIndex] = useState(0);
  const closeModal = () => setOpenModal(null);

  // A fake scan: each slot shows its own icon as the "crop", every other one flagged for review
  const reviewItems = useMemo<ScannedReviewItem[]>(() => {
    const picks = SAMPLE_INDEXES.map((i) => materials[i % materials.length]);
    return picks.map((m, i) => {
      const runnerUp = picks[(i + 1) % picks.length];
      return {
        id: `sample-${i}`,
        materialId: m.id,
        name: m.name,
        quantity: SAMPLE_QUANTITIES[i],
        rarity: m.rarity,
        imageSnippet: materialThumbUrl(m.id),
        sourceImageName: "sample.png",
        row: Math.floor(i / 3),
        col: i % 3,
        candidates: [
          { id: m.id, name: m.name, rarity: m.rarity, confidence: 0.92 },
          {
            id: runnerUp.id,
            name: runnerUp.name,
            rarity: runnerUp.rarity,
            confidence: 0.61,
          },
        ],
        reviewReason: i % 2 === 1 ? "Close runner-up" : undefined,
      };
    });
  }, [materials]);

  const toastBurst = () => {
    toast.success("Assigned Mystic Enhancement Ore");
    setTimeout(() => toast.info("No items to add."), 250);
    setTimeout(() => toast.error("Connection failed: invalid API key"), 500);
  };

  return (
    <section className="glass-card glass-card--lg mb-6 w-full max-w-7xl space-y-5 p-5 sm:p-6">
      <header className="flex items-center gap-3">
        <span className="glass-chip h-9 w-9 justify-center rounded-xl text-cyan-300">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-white">Motion Playground</h2>
          <p className="text-xs text-white/60">
            Fire toasts and open modals to check their glass and
            squash-and-stretch.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <TriggerGroup icon={Bell} title="Toasts">
          <TriggerButton onClick={() => toast.success('Copied ID: "mora"')}>
            Success
          </TriggerButton>
          <TriggerButton
            onClick={() => toast.error("Scan failed: network error")}
          >
            Error
          </TriggerButton>
          <TriggerButton onClick={() => toast.info("No items to add.")}>
            Info
          </TriggerButton>
          <TriggerButton
            onClick={() => toast.warning("Some slots need a second look")}
          >
            Warning
          </TriggerButton>
          <TriggerButton
            onClick={() =>
              toast.error(
                "Scan failed: the AI provider returned an empty response. Check the model name and your API key in Scanner Settings, then try again.",
                { duration: 9000 },
              )
            }
          >
            Long error
          </TriggerButton>
          <TriggerButton onClick={toastBurst}>Burst of 3</TriggerButton>
        </TriggerGroup>

        <TriggerGroup icon={PanelTop} title="Modals">
          <TriggerButton onClick={() => setOpenModal("material")}>
            Material details
          </TriggerButton>
          <TriggerButton onClick={() => setOpenModal("settings")}>
            Scanner settings
          </TriggerButton>
          <TriggerButton onClick={() => setOpenModal("review")}>
            Scan review (+ picker via Change)
          </TriggerButton>
        </TriggerGroup>
      </div>

      {openModal === "material" && (
        <MaterialModal
          material={materials[materialIndex]}
          onClose={closeModal}
          onNavigateNext={() =>
            setMaterialIndex((i) => Math.min(materials.length - 1, i + 1))
          }
          onNavigatePrev={() => setMaterialIndex((i) => Math.max(0, i - 1))}
          hasNext={materialIndex < materials.length - 1}
          hasPrev={materialIndex > 0}
          total={materials.length}
        />
      )}
      {openModal === "settings" && (
        <LazyScannerSettingsModal onClose={closeModal} />
      )}
      {openModal === "review" && (
        <LazyScanReviewModal
          reviewItems={reviewItems}
          onClose={closeModal}
          onConfirm={closeModal}
        />
      )}
    </section>
  );
}

function TriggerGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card space-y-3 p-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function TriggerButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="glass-btn px-4 py-2 text-xs">
      {children}
    </button>
  );
}
