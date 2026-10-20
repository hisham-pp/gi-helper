"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";

export interface PillTabOption<T extends string | number> {
  value: T;
  /** Text or a styled span before the count. */
  label: React.ReactNode;
  count: number;
  /** RGB triplet ("34, 211, 238") for the thumb's fill and glow on this tab. */
  accent?: string;
  title?: string;
}

interface PillTabsProps<T extends string | number> {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

const DEFAULT_ACCENT = "34, 211, 238";

/**
 * Filter tabs in the scanner-tab style: a recessed glass track with a count
 * badge on every tab and one thumb that slides (and squashes) to the selected
 * tab. Tabs keep their natural widths, so the thumb is measured from the
 * selected button; it takes that tab's accent for the same fill and glow as a
 * selected glass chip.
 */
export function PillTabs<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: PillTabsProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const activeIndex = options.findIndex((o) => o.value === value);
  const displayIndex = dragIndex !== null ? dragIndex : activeIndex;
  const accent = options[displayIndex]?.accent ?? options[activeIndex]?.accent ?? DEFAULT_ACCENT;
  const prevIndexRef = useRef(activeIndex);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const currentDragIndexRef = useRef<number | null>(null);
  const currentThumbGeoRef = useRef<{ left: number; width: number }>({ left: 0, width: 0 });
  const isCancelledRef = useRef(false);
  const justDraggedRef = useRef(false);

  // Follow the selected tab, also when counts change its width
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const button =
        track.querySelectorAll<HTMLElement>("[data-tab]")[activeIndex];
      setThumb(
        button ? { left: button.offsetLeft, width: button.offsetWidth } : null,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activeIndex, options]);

  // Same squash-and-stretch as the scanner tab thumb (for direct taps only)
  useLayoutEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion || isDragging) return;
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

  const getButtonsGeo = () => {
    const track = trackRef.current;
    if (!track) return [];
    const buttons = Array.from(track.querySelectorAll<HTMLElement>("[data-tab]"));
    return buttons.map((btn, idx) => ({
      index: idx,
      left: btn.offsetLeft,
      width: btn.offsetWidth,
      rect: btn.getBoundingClientRect(),
    }));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    currentDragIndexRef.current = activeIndex;
    if (thumb) {
      currentThumbGeoRef.current = { left: thumb.left, width: thumb.width };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();

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

    const isOutOfBounds =
      touch.clientY < trackRect.top - 50 || touch.clientY > trackRect.bottom + 50;

    const geo = getButtonsGeo();
    if (!geo.length) return;

    if (isOutOfBounds) {
      if (!isCancelledRef.current) {
        isCancelledRef.current = true;
        setDragIndex(null);
        currentDragIndexRef.current = activeIndex;

        const currentGeo = currentThumbGeoRef.current;
        const targetBtn = geo[activeIndex] || geo[0];

        if (thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
          const anim = thumbRef.current.animate(
            [
              {
                transform: `translateX(${currentGeo.left}px) scale(1.04, 0.94)`,
                width: `${currentGeo.width}px`,
              },
              {
                transform: `translateX(${targetBtn.left}px) scale(1, 1)`,
                width: `${targetBtn.width}px`,
              },
            ],
            {
              duration: 260,
              easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
              fill: "forwards",
            },
          );
          anim.onfinish = () => {
            if (thumbRef.current) {
              thumbRef.current.style.transform = "";
              thumbRef.current.style.width = "";
            }
            try {
              anim.cancel();
            } catch {
              // ignore
            }
          };
        } else if (thumbRef.current) {
          thumbRef.current.style.transform = "";
          thumbRef.current.style.width = "";
        }
        haptics.dragTick();
      }
      return;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
    }

    // Determine which tab is under the finger
    let hovered = activeIndex >= 0 ? activeIndex : 0;
    for (let i = 0; i < geo.length; i++) {
      const r = geo[i].rect;
      if (touch.clientX >= r.left && touch.clientX <= r.right) {
        hovered = i;
        break;
      }
    }
    if (touch.clientX < geo[0].rect.left) hovered = 0;
    else if (touch.clientX > geo[geo.length - 1].rect.right) hovered = geo.length - 1;

    const targetTab = geo[hovered];
    const firstTab = geo[0];
    const lastTab = geo[geo.length - 1];
    const minLeft = firstTab.left;
    const maxLeft = lastTab.left + lastTab.width - targetTab.width;

    const fingerRelX = touch.clientX - trackRect.left;
    const rawLeft = fingerRelX - targetTab.width / 2;
    const clampedLeft = Math.max(minLeft, Math.min(rawLeft, maxLeft));

    currentThumbGeoRef.current = { left: clampedLeft, width: targetTab.width };

    if (thumbRef.current && !reducedMotion) {
      thumbRef.current.style.transform = `translateX(${clampedLeft}px) scale(1.04, 0.94)`;
      thumbRef.current.style.width = `${targetTab.width}px`;
    }

    if (hovered !== currentDragIndexRef.current) {
      currentDragIndexRef.current = hovered;
      setDragIndex(hovered);
      haptics.dragTick();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;

    const hadDragged = hasDraggedRef.current;
    const wasCancelled = isCancelledRef.current;
    const targetIndex = currentDragIndexRef.current;
    const currentGeo = currentThumbGeoRef.current;

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;

    if (hadDragged) {
      e.preventDefault();
      justDraggedRef.current = true;

      const geo = getButtonsGeo();
      const finalIndex =
        !wasCancelled && targetIndex !== null && targetIndex >= 0 && targetIndex < options.length
          ? targetIndex
          : activeIndex;

      const targetBtn = geo[finalIndex] || geo[0];

      setIsDragging(false);
      setDragIndex(null);

      if (thumbRef.current && targetBtn && !reducedMotion && typeof thumbRef.current.animate === "function") {
        const anim = thumbRef.current.animate(
          [
            {
              transform: `translateX(${currentGeo.left}px) scale(1.04, 0.94)`,
              width: `${currentGeo.width}px`,
            },
            {
              transform: `translateX(${targetBtn.left}px) scale(1, 1)`,
              width: `${targetBtn.width}px`,
            },
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
            thumbRef.current.style.width = "";
          }
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
      } else if (thumbRef.current) {
        thumbRef.current.style.transform = "";
        thumbRef.current.style.width = "";
      }

      if (!wasCancelled && targetIndex !== null && targetIndex >= 0 && targetIndex < options.length) {
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
        thumbRef.current.style.width = "";
      }
      setIsDragging(false);
      setDragIndex(null);
    }
  };

  const handleTouchCancel = () => {
    if (hasDraggedRef.current && thumbRef.current && !reducedMotion && typeof thumbRef.current.animate === "function") {
      const geo = getButtonsGeo();
      const targetBtn = geo[activeIndex] || geo[0];
      const currentGeo = currentThumbGeoRef.current;

      if (targetBtn) {
        const anim = thumbRef.current.animate(
          [
            {
              transform: `translateX(${currentGeo.left}px) scale(1.04, 0.94)`,
              width: `${currentGeo.width}px`,
            },
            {
              transform: `translateX(${targetBtn.left}px) scale(1, 1)`,
              width: `${targetBtn.width}px`,
            },
          ],
          {
            duration: 260,
            easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
            fill: "forwards",
          },
        );
        anim.onfinish = () => {
          if (thumbRef.current) {
            thumbRef.current.style.transform = "";
            thumbRef.current.style.width = "";
          }
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
      }
    } else if (thumbRef.current) {
      thumbRef.current.style.transform = "";
      thumbRef.current.style.width = "";
    }

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    setIsDragging(false);
    setDragIndex(null);
  };

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label={ariaLabel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={`glass-track inline-flex shrink-0 items-center gap-1 p-1 touch-none ${className}`}
    >
      <div
        ref={thumbRef}
        aria-hidden="true"
        data-active="true"
        className="glass-chip--fill pointer-events-none absolute bottom-1 left-0 top-1 z-0 rounded-full"
        style={
          {
            "--glass-accent": accent,
            width: thumb?.width ?? 0,
            transform: `translateX(${thumb?.left ?? 0}px)`,
            opacity: thumb ? 1 : 0,
            transition: isDragging
              ? "none"
              : reducedMotion
                ? "none"
                : "transform 420ms cubic-bezier(0.34, 1.35, 0.5, 1), width 420ms cubic-bezier(0.34, 1.35, 0.5, 1), opacity 200ms",
          } as React.CSSProperties
        }
      />

      {options.map((option, index) => {
        const isActive = index === displayIndex;
        return (
          <button
            key={option.value}
            type="button"
            data-tab
            onClick={() => {
              if (hasDraggedRef.current) return;
              if (option.value !== value) {
                haptics.selection();
              }
              onChange(option.value);
            }}
            aria-pressed={isActive}
            title={option.title}
            className={`relative z-10 flex shrink-0 select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
              isActive ? "text-white" : "text-white/60 hover:text-white/90"
            }`}
          >
            <span className="whitespace-nowrap">{option.label}</span>
            <span
              className={`rounded-full px-1.5 text-[10px] transition-colors ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
