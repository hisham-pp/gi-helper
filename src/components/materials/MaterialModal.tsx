"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Tag,
  Layers,
  Bookmark,
} from "lucide-react";
import { MaterialItem } from "@/lib/types";
import { bagOrder, getRarityStyles, getMaterialCategoryLabel, materialThumbUrl } from "@/lib/materials/ui";
import { toast } from "sonner";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { triggerHaptic } from "@/lib/haptics";

interface MaterialModalProps {
  material: MaterialItem;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  /** Number of materials in the dataset, shown as "#order / total". */
  total?: number;
  /** The description is still loading (see useMaterialDescriptions). */
  descriptionPending?: boolean;
}

/** Material details. MaterialList loads it on demand and mounts it only while a material is selected. */
export function MaterialModal({
  material,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
  total,
  descriptionPending = false,
}: MaterialModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState(materialThumbUrl(material.id));
  const [imgError, setImgError] = useState(false);

  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose);
  const [navDirection, setNavDirection] = useState<"next" | "prev" | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // When material changes, reset drag state and trigger smooth directional slide-in on the modal dialog
  useEffect(() => {
    setCopied(false);
    setImgSrc(materialThumbUrl(material.id));
    setImgError(false);

    const el = dialogRef.current;
    if (!el) return;

    el.style.transform = "";
    el.style.opacity = "";
    el.style.transition = "";

    if (navDirection) {
      const animClass = navDirection === "next" ? "anim-slide-in-right" : "anim-slide-in-left";
      el.classList.remove("anim-slide-in-right", "anim-slide-in-left");
      void el.offsetWidth; // Force reflow to restart animation
      el.classList.add(animClass);
    }
  }, [material, navDirection, dialogRef]);

  // Non-passive listener to prevent browser background scroll/navigation during horizontal card drag
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

    // If vertical movement dominates, allow standard scroll inside the modal content
    if (!isDraggingRef.current && Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) > 8) {
      isDraggingRef.current = true;
      e.stopPropagation();
    }

    if (!isDraggingRef.current) return;
    e.stopPropagation();

    // Apply damping if dragging beyond available materials
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

    // Check if horizontal swipe threshold met (> 45px and predominantly horizontal)
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

    // Snap back smoothly if cancelled
    el.style.transition = "transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out";
    el.style.transform = "translateX(0px) rotate(0deg)";
    el.style.opacity = "1";
  };

  const handleImgError = () => {
    if (material.image && imgSrc !== material.image) {
      setImgSrc(material.image);
    } else {
      setImgError(true);
    }
  };

  // Handle keyboard events (Escape, Left, Right)
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

  const rarity = material.rarity || 1;
  const styles = getRarityStyles(rarity);
  const categoryLabel = getMaterialCategoryLabel(material);

  const handleCopyId = () => {
    navigator.clipboard.writeText(material.id);
    setCopied(true);
    toast.success(`Copied ID: "${material.id}"`);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* Backdrop: a sibling of the dialog, so its fade doesn't fade the dialog */}
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
          {/* Top Header Actions */}
          <div className="flex items-center justify-between pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="glass-chip gap-1 px-3 py-1 font-mono text-xs font-bold text-white">
                <span className="font-bold text-cyan-300">#</span>
                {bagOrder(material).position}
                {total !== undefined && bagOrder(material).tab !== "Materials" && (
                  <span className="ml-0.5 text-[10px] text-white/40">/ {total}</span>
                )}
              </span>
              <span className={`glass-chip px-2.5 py-1 text-xs font-semibold ${styles.starColor}`}>
                {rarity}★ Rarity
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev / Next controls: hidden on mobile, visible from sm up */}
              <button
                onClick={() => {
                  setNavDirection("prev");
                  onNavigatePrev?.();
                }}
                disabled={!hasPrev}
                className="glass-icon-btn hidden h-8 w-8 rounded-full sm:inline-flex"
                title="Previous Material (Left Arrow)"
                aria-label="Previous Material"
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
                title="Next Material (Right Arrow)"
                aria-label="Next Material"
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

          {/* Material Main Content */}
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start shrink-0">
            {/* Big Item Frame */}
            <div className="glass-well glass-well--tinted relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl">
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt={material.name}
                  width={96}
                  height={96}
                  decoding="async"
                  className="h-24 w-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                  onError={handleImgError}
                />
              ) : (
                <span className="text-xs text-white/50">No Image</span>
              )}
            </div>

            {/* Title & Core Metadata */}
            <div className="flex flex-1 flex-col items-center sm:items-start">
              <div className="flex items-center gap-1 text-sm font-bold drop-shadow">
                {Array.from({ length: rarity }).map((_, i) => (
                  <span key={i} className={styles.starColor}>
                    ★
                  </span>
                ))}
              </div>

              <h2 className="mt-1 text-center text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-left sm:text-2xl">
                {material.name}
              </h2>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="glass-chip gap-1.5 px-3 py-1 text-xs font-medium text-white/85">
                  <Tag className="h-3 w-3 text-cyan-300" />
                  {categoryLabel}
                </span>

                {material.sortRank !== undefined && (
                  <span
                    className="glass-chip gap-1.5 px-3 py-1 font-mono text-xs text-white/70"
                    title="In-Game sortRank field"
                  >
                    <Layers className="h-3 w-3 text-cyan-300/80" />
                    SortRank: {material.sortRank}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Item ID Bar */}
          <div className="glass-well mt-5 flex items-center justify-between rounded-2xl p-2 pl-3.5 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <span className="font-mono text-white/40">ID:</span>
              <code className="truncate font-mono font-semibold text-cyan-300">
                {material.id}
              </code>
            </div>
            <button
              onClick={handleCopyId}
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
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* In-Game Lore / Description */}
          <div className="mt-4 flex flex-1 flex-col min-h-0">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50 shrink-0">
              <Bookmark className="h-3.5 w-3.5 text-cyan-300" />
              In-Game Description & Lore
            </h4>
            <div className="glass-well mt-2 flex-1 min-h-0 overflow-y-auto rounded-2xl p-3.5 text-xs leading-relaxed text-white/80">
              {material.description ? (
                material.description.split("\n").map((line, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))
              ) : (
                <span className="italic text-white/40">
                  {descriptionPending ? "Loading description…" : "No description available."}
                </span>
              )}
            </div>
          </div>

          {/* Footer Navigation Tip */}
          <div className="glass-divider mt-4 shrink-0" />
          <div className="flex items-center justify-between pt-3 text-[11px] text-white/40 shrink-0">
            <span className="hidden sm:inline">Tip: Use Arrow keys to browse materials in order</span>
            <span className="sm:hidden">Tip: Swipe left/right to browse</span>
            <span className="font-mono">Esc to close</span>
          </div>
        </div>
      </div>
  </div>
);
}

