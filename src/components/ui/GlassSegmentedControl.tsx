"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";

export interface GlassSegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

interface GlassSegmentedControlProps<T extends string = string> {
  options: GlassSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** Hide labels below the `sm` breakpoint, leaving icons only */
  compactOnMobile?: boolean;
}

/** Track padding and gap between segments, in px (matches p-1 / gap-1). */
const PAD = 4;
const GAP = 4;

/**
 * Segmented switch in the scanner-tab style: a recessed glass track with a
 * raised glass thumb that springs to the selected option and squashes and
 * stretches on the way (styles in src/styles/glass.css).
 */
export function GlassSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  compactOnMobile = false,
}: GlassSegmentedControlProps<T>) {
  const count = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevIndexRef = useRef(activeIndex);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const currentDragIndexRef = useRef<number | null>(null);
  const currentThumbLeftRef = useRef(0);
  const isCancelledRef = useRef(false);
  const justDraggedRef = useRef(false);

  const displayIndex = dragIndex !== null ? dragIndex : activeIndex;

  // Same squash-and-stretch as the scanner tab thumb (for direct taps only).
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (prevIndex === activeIndex || reducedMotion || isDragging) return;

    thumbRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.1 0.88", offset: 0.35 },
        { scale: "0.96 1.05", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [activeIndex, reducedMotion, isDragging]);

  const select = (index: number) => {
    if (index !== activeIndex) {
      haptics.selection();
    }
    onChange(options[index].value);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: (activeIndex + 1) % count,
      ArrowDown: (activeIndex + 1) % count,
      ArrowLeft: (activeIndex - 1 + count) % count,
      ArrowUp: (activeIndex - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]);
  };

  // --- Drag over segments gesture handling ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    currentDragIndexRef.current = activeIndex;

    const innerWidth = rect.width - 2 * PAD;
    const segWidth = (innerWidth - (count - 1) * GAP) / count;
    const step = segWidth + GAP;
    currentThumbLeftRef.current = Math.max(0, activeIndex * step);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!hasDraggedRef.current) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      } else if (Math.abs(dy) > 12) {
        return;
      }
    }

    if (!hasDraggedRef.current) return;

    const innerWidth = rect.width - 2 * PAD;
    const segWidth = (innerWidth - (count - 1) * GAP) / count;
    const step = segWidth + GAP;

    const isOutOfBounds =
      touch.clientY < rect.top - 50 || touch.clientY > rect.bottom + 50;

    if (isOutOfBounds) {
      if (!isCancelledRef.current) {
        isCancelledRef.current = true;
        setDragIndex(null);
        currentDragIndexRef.current = activeIndex;
        const startLeft = currentThumbLeftRef.current;
        const targetLeft = activeIndex * step;

        if (thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
          const anim = thumbRef.current.animate(
            [
              { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
              { transform: `translateX(${targetLeft}px) scale(1, 1)` },
            ],
            {
              duration: 260,
              easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
              fill: "forwards",
            },
          );
          anim.onfinish = () => {
            if (thumbRef.current) thumbRef.current.style.transform = "";
            try {
              anim.cancel();
            } catch {
              // ignore
            }
          };
        } else if (thumbRef.current) {
          thumbRef.current.style.transform = "";
        }
        haptics.dragTick();
      }
      return;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
    }

    const relX = touch.clientX - rect.left - PAD;
    const targetThumbLeft = relX - segWidth / 2;
    const maxLeft = (count - 1) * step;
    const clampedThumbLeft = Math.max(0, Math.min(targetThumbLeft, maxLeft));
    currentThumbLeftRef.current = clampedThumbLeft;

    if (thumbRef.current && !reducedMotion) {
      thumbRef.current.style.transform = `translateX(${clampedThumbLeft}px) scale(1.05, 0.94)`;
    }

    const clampedRelX = Math.max(0, Math.min(relX, innerWidth));
    const newIndex = Math.min(
      Math.floor(clampedRelX / (innerWidth / count)),
      count - 1,
    );

    if (newIndex !== currentDragIndexRef.current) {
      currentDragIndexRef.current = newIndex;
      setDragIndex(newIndex);
      haptics.dragTick();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const hadDragged = hasDraggedRef.current;
    const wasCancelled = isCancelledRef.current;
    const targetIndex = currentDragIndexRef.current;
    const startLeft = currentThumbLeftRef.current;

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;

    if (hadDragged) {
      e.preventDefault();
      justDraggedRef.current = true;

      const rect = trackRef.current?.getBoundingClientRect();
      const innerWidth = (rect?.width ?? 320) - 2 * PAD;
      const segWidth = (innerWidth - (count - 1) * GAP) / count;
      const step = segWidth + GAP;

      const finalIndex =
        !wasCancelled && targetIndex !== null && targetIndex >= 0
          ? targetIndex
          : activeIndex;
      const targetLeft = finalIndex * step;

      setIsDragging(false);
      setDragIndex(null);

      if (thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
        const anim = thumbRef.current.animate(
          [
            { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
            { transform: `translateX(${targetLeft}px) scale(1, 1)` },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
            fill: "forwards",
          },
        );
        anim.onfinish = () => {
          if (thumbRef.current) {
            thumbRef.current.style.transform = "";
          }
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
      } else if (thumbRef.current) {
        thumbRef.current.style.transform = "";
      }

      if (!wasCancelled && targetIndex !== null && targetIndex >= 0) {
        if (targetIndex !== activeIndex) {
          haptics.dragSnap();
          onChange(options[targetIndex].value);
        } else {
          haptics.selection();
        }
      }
    } else {
      if (thumbRef.current) {
        thumbRef.current.style.transform = "";
      }
      setIsDragging(false);
      setDragIndex(null);
    }
  };

  const handleTouchCancel = () => {
    if (hasDraggedRef.current && thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
      const rect = trackRef.current?.getBoundingClientRect();
      const innerWidth = (rect?.width ?? 320) - 2 * PAD;
      const segWidth = (innerWidth - (count - 1) * GAP) / count;
      const step = segWidth + GAP;
      const startLeft = currentThumbLeftRef.current;
      const targetLeft = activeIndex * step;

      const anim = thumbRef.current.animate(
        [
          { transform: `translateX(${startLeft}px) scale(1.05, 0.94)` },
          { transform: `translateX(${targetLeft}px) scale(1, 1)` },
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
          fill: "forwards",
        },
      );
      anim.onfinish = () => {
        if (thumbRef.current) thumbRef.current.style.transform = "";
        try {
          anim.cancel();
        } catch {
          // ignore
        }
      };
    } else if (thumbRef.current) {
      thumbRef.current.style.transform = "";
    }

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    setIsDragging(false);
    setDragIndex(null);
  };

  return (
    // Equal-width columns sized to the widest option, so the thumb lines up exactly
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="glass-track inline-grid auto-cols-fr grid-flow-col gap-1 p-1 touch-none"
    >
      <div
        ref={thumbRef}
        aria-hidden="true"
        className="glass-thumb bottom-1 left-1 top-1"
        style={{
          width: `calc((100% - ${2 * PAD + (count - 1) * GAP}px) / ${count})`,
          transform: `translateX(calc(${displayIndex} * (100% + ${GAP}px)))`,
          transition: isDragging
            ? "none"
            : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
        }}
      />

      {options.map((option, index) => {
        const isActive = index === displayIndex;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            title={option.title ?? option.label}
            onClick={() => {
              if (hasDraggedRef.current) return;
              select(index);
            }}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
              isActive
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                : "text-white/55 hover:text-white/85"
            }`}
          >
            {option.icon && (
              <span
                className={`shrink-0 transition-colors ${isActive ? "text-cyan-200" : "text-white/45"}`}
              >
                {option.icon}
              </span>
            )}
            <span className={compactOnMobile ? "hidden sm:inline" : undefined}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
