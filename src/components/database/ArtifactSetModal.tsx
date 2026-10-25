"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Flower2,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  type ArtifactSetInfo,
  type SlotKey,
  artifactIconUrl,
} from "@gi/good";
import { getRarityStyles } from "@/lib/materials/ui";
import { GameIcon } from "@/components/ui/GameIcon";
import { RarityStars } from "@/components/inventory/shared";
import { toast } from "sonner";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { triggerHaptic } from "@/lib/haptics";

const SLOT_KEYS: SlotKey[] = ["flower", "plume", "sands", "goblet", "circlet"];

const SLOT_NAMES: Record<SlotKey, string> = {
  flower: "Flower of Life",
  plume: "Plume of Death",
  sands: "Sands of Eon",
  goblet: "Goblet of Eonothem",
  circlet: "Circlet of Logos",
};

const BONUS_LABELS: Record<"1" | "2" | "4", string> = {
  "1": "1-Piece Set Bonus",
  "2": "2-Piece Set Bonus",
  "4": "4-Piece Set Bonus",
};

interface ArtifactSetModalProps {
  set: ArtifactSetInfo;
  owned?: number;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  total?: number;
  index?: number;
}

/** Artifact set details modal in the /db/artifacts database. */
export function ArtifactSetModal({
  set,
  owned = 0,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
  total,
  index,
}: ArtifactSetModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotKey>(() => {
    const first = SLOT_KEYS.find((k) => set.pieces[k]);
    return first ?? "flower";
  });

  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose);
  const [navDirection, setNavDirection] = useState<"next" | "prev" | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setCopied(false);
    const first = SLOT_KEYS.find((k) => set.pieces[k]);
    setSelectedSlot(first ?? "flower");

    const el = dialogRef.current;
    if (!el) return;

    el.style.transform = "";
    el.style.opacity = "";
    el.style.transition = "";

    if (navDirection) {
      const animClass = navDirection === "next" ? "anim-slide-in-right" : "anim-slide-in-left";
      el.classList.remove("anim-slide-in-right", "anim-slide-in-left");
      void el.offsetWidth;
      el.classList.add(animClass);
    }
  }, [set, navDirection, dialogRef]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const onTouchMoveNative = (e: TouchEvent) => {
      if (isDraggingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", onTouchMoveNative, { passive: false });
    return () => {
      el.removeEventListener("touchmove", onTouchMoveNative);
    };
  }, [dialogRef]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isDraggingRef.current = false;
      const el = dialogRef.current;
      if (el) {
        el.style.transition = "none";
        el.classList.remove("anim-slide-in-right", "anim-slide-in-left");
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (!isDraggingRef.current && Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) > 8) {
      isDraggingRef.current = true;
      e.stopPropagation();
    }

    if (!isDraggingRef.current) return;
    e.stopPropagation();

    let effectiveX = deltaX;
    if ((deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext)) {
      effectiveX = deltaX * 0.22;
    }

    const el = dialogRef.current;
    if (el) {
      const rotate = effectiveX * 0.025;
      const opacity = Math.max(0.65, 1 - Math.abs(effectiveX) / 380);
      el.style.transform = `translateX(${effectiveX}px) rotate(${rotate}deg)`;
      el.style.opacity = `${opacity}`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    e.stopPropagation();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    const el = dialogRef.current;
    if (!el) return;

    if (wasDragging && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && hasNext && onNavigateNext) {
        triggerHaptic("light");
        el.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
        el.style.transform = "translateX(-120px) rotate(-4deg)";
        el.style.opacity = "0";
        setNavDirection("next");
        onNavigateNext();
        return;
      } else if (deltaX > 0 && hasPrev && onNavigatePrev) {
        triggerHaptic("light");
        el.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
        el.style.transform = "translateX(120px) rotate(4deg)";
        el.style.opacity = "0";
        setNavDirection("prev");
        onNavigatePrev();
        return;
      }
    }

    el.style.transition = "transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out";
    el.style.transform = "translateX(0px) rotate(0deg)";
    el.style.opacity = "1";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowRight" && hasNext && onNavigateNext) {
        setNavDirection("next");
        onNavigateNext();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigatePrev) {
        setNavDirection("prev");
        onNavigatePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNavigateNext, onNavigatePrev, close]);

  const topRarity = Math.max(...set.rarities);
  const lowRarity = Math.min(...set.rarities);
  const styles = getRarityStyles(topRarity);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(set.key);
    setCopied(true);
    toast.success(`Copied Key: "${set.key}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  const pieceSlots = SLOT_KEYS.filter((slot) => set.pieces[slot]);
  const activePieceName = set.pieces[selectedSlot] ?? set.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden overscroll-none touch-none select-none"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget && e.cancelable) {
          e.preventDefault();
        }
      }}
    >
      <style>{`
        @keyframes modal-slide-in-right {
          from { opacity: 0; transform: translateX(56px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes modal-slide-in-left {
          from { opacity: 0; transform: translateX(-56px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .anim-slide-in-right {
          animation: modal-slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-in-left {
          animation: modal-slide-in-left 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm touch-none overscroll-none"
        onClick={close}
        onTouchMove={(e) => {
          if (e.cancelable) e.preventDefault();
        }}
      />

      <div
        ref={dialogRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onAnimationEnd={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current?.classList.remove("anim-slide-in-right", "anim-slide-in-left");
          }
        }}
        style={{ "--glass-accent": styles.accent } as React.CSSProperties}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex h-[580px] sm:h-[600px] max-h-[90vh] sm:max-h-[86vh] w-full max-w-lg flex-col overflow-hidden p-5 sm:p-6 touch-pan-y will-change-transform"
      >
        <div className="flex flex-1 flex-col min-h-0 w-full overflow-y-auto pr-0.5 overscroll-contain touch-pan-y">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 shrink-0">
            <div className="flex items-center gap-2">
              {index !== undefined && total !== undefined && (
                <span className="glass-chip gap-1 px-3 py-1 font-mono text-xs font-bold text-white">
                  <span className="font-bold text-cyan-300">#</span>
                  {index + 1}
                  <span className="ml-0.5 text-[10px] text-white/40">/ {total}</span>
                </span>
              )}
              <span className={`glass-chip px-2.5 py-1 text-xs font-semibold ${styles.starColor}`}>
                {lowRarity !== topRarity ? `${lowRarity}★ – ${topRarity}★` : `${topRarity}★`} Set
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setNavDirection("prev");
                  onNavigatePrev?.();
                }}
                disabled={!hasPrev}
                className="glass-icon-btn hidden h-8 w-8 rounded-full sm:inline-flex"
                title="Previous Artifact Set (Left Arrow)"
                aria-label="Previous Artifact Set"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setNavDirection("next");
                  onNavigateNext?.();
                }}
                disabled={!hasNext}
                className="glass-icon-btn hidden h-8 w-8 rounded-full sm:inline-flex"
                title="Next Artifact Set (Right Arrow)"
                aria-label="Next Artifact Set"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={close}
                className="glass-icon-btn h-8 w-8 rounded-full sm:ml-2"
                title="Close (Escape)"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="glass-divider shrink-0" />

          {/* Artifact Main Profile */}
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start shrink-0">
            {/* Big Selected Piece Frame */}
            <div className="glass-well glass-well--tinted relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl">
              <GameIcon
                src={artifactIconUrl(set.id, selectedSlot)}
                alt={activePieceName}
                size={96}
                className="h-24 w-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                fallback={<Flower2 className="h-10 w-10 text-white/40" />}
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-1 flex-col items-center sm:items-start">
              <RarityStars rarity={topRarity} className="text-sm drop-shadow" />

              <h2 className="mt-1 text-center text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-left sm:text-2xl">
                {set.name}
              </h2>

              <p className="mt-1 text-xs text-cyan-300 font-medium">
                {activePieceName}
                <span className="ml-1 text-[11px] text-white/50 font-normal">
                  ({SLOT_NAMES[selectedSlot]})
                </span>
              </p>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="glass-chip gap-1.5 px-3 py-1 text-xs font-medium text-white/85">
                  <Layers className="h-3.5 w-3.5 text-cyan-300" />
                  {pieceSlots.length} {pieceSlots.length === 1 ? "Piece" : "Pieces"} Set
                </span>
              </div>
            </div>
          </div>

          {/* Pieces Picker Carousel / Row */}
          <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 shrink-0">
            {pieceSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedSlot(slot);
                  }}
                  className={`glass-well relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                    isSelected
                      ? "ring-2 ring-cyan-400 bg-white/15 scale-105"
                      : "opacity-70 hover:opacity-100 hover:scale-100"
                  }`}
                  title={`${set.pieces[slot]} (${SLOT_NAMES[slot]})`}
                  aria-label={`${set.pieces[slot]} (${SLOT_NAMES[slot]})`}
                >
                  <GameIcon
                    src={artifactIconUrl(set.id, slot)}
                    alt={set.pieces[slot] ?? SLOT_NAMES[slot]}
                    size={40}
                    className="h-9 w-9 object-contain drop-shadow"
                    fallback={<Flower2 className="h-5 w-5 text-white/40" />}
                  />
                </button>
              );
            })}
          </div>

          {/* Inventory Ownership Banner */}
          <div className="glass-well mt-4 flex items-center justify-between rounded-2xl p-3 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <Flower2 className="h-4 w-4 text-emerald-400" />
              <span className="text-white/70">Inventory status:</span>
              {owned > 0 ? (
                <span className="font-semibold text-emerald-300">
                  {owned} {owned === 1 ? "piece" : "pieces"} in your inventory
                </span>
              ) : (
                <span className="text-white/50 italic">No pieces in your inventory</span>
              )}
            </div>
          </div>

          {/* Key / GOOD ID Bar */}
          <div className="glass-well mt-3 flex items-center justify-between rounded-2xl p-2 pl-3.5 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <span className="font-mono text-white/40">GOOD Key:</span>
              <code className="truncate font-mono font-semibold text-cyan-300">
                {set.key}
              </code>
            </div>
            <button
              onClick={handleCopyKey}
              className="glass-btn shrink-0 gap-1.5 px-3 py-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>

          {/* Set Bonuses Section */}
          <div className="mt-4 flex flex-1 flex-col min-h-0">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Set Bonuses
            </h4>

            <div className="glass-well mt-2 flex-1 min-h-0 overflow-y-auto rounded-2xl p-3.5 text-xs text-white/80 space-y-2.5">
              {(["1", "2", "4"] as const).map((n) =>
                set.bonuses[n] ? (
                  <div key={n} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="glass-chip px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                      {BONUS_LABELS[n]}
                    </span>
                    <p className="mt-1.5 leading-relaxed text-white/90">
                      {set.bonuses[n]}
                    </p>
                  </div>
                ) : null,
              )}

              {!set.bonuses["1"] && !set.bonuses["2"] && !set.bonuses["4"] && (
                <span className="italic text-white/40">No set bonuses recorded.</span>
              )}
            </div>
          </div>

          {/* Footer Navigation Tip */}
          <div className="glass-divider mt-4 shrink-0" />
          <div className="flex items-center justify-between pt-3 text-[11px] text-white/40 shrink-0">
            <span className="hidden sm:inline">Tip: Use Arrow keys to browse artifact sets in order</span>
            <span className="sm:hidden">Tip: Swipe left/right to browse</span>
            <span className="font-mono">Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
