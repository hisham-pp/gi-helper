"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { haptics } from "@/lib/haptics";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  panelId: string;
}

interface ScannerTabsProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  ariaLabel?: string;
}

/**
 * Animated Pill Tabs with smooth sliding indicator and keyboard accessibility.
 * Supports Left/Right arrow navigation, Home, End, and theme-matching glassmorphic styling.
 * The indicator is a raised glass thumb in a recessed glass track
 * (styles in src/styles/glass.css).
 */
export function ScannerTabs({
  tabs,
  activeIndex,
  onTabChange,
  ariaLabel = "Scanner modes",
}: ScannerTabsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
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

  // The thumb stretches while it travels, then settles back like a soft lens (only on taps, not post-drag).
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (prevIndex === activeIndex || reducedMotion || isDragging) return;

    indicatorRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.06 0.92", offset: 0.35 },
        { scale: "0.98 1.03", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [activeIndex, reducedMotion, isDragging]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    if (nextIndex !== index) {
      haptics.selection();
    }
    onTabChange(nextIndex);
    tabButtonRefs.current[nextIndex]?.focus();
  };

  // --- Drag over tabs gesture handling ---
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

    const padding = 6;
    const innerWidth = rect.width - 2 * padding;
    const gap = 4;
    const tabCount = tabs.length;
    const tabWidth = (innerWidth - (tabCount - 1) * gap) / tabCount;
    const step = tabWidth + gap;
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

    const padding = 6; // p-1.5 = 6px
    const innerWidth = rect.width - 2 * padding;
    const gap = 4;
    const tabCount = tabs.length;
    const tabWidth = (innerWidth - (tabCount - 1) * gap) / tabCount;
    const step = tabWidth + gap;

    const isOutOfBounds =
      touch.clientY < rect.top - 60 || touch.clientY > rect.bottom + 50;

    if (isOutOfBounds) {
      if (!isCancelledRef.current) {
        isCancelledRef.current = true;
        setDragIndex(null);
        currentDragIndexRef.current = activeIndex;
        const startLeft = currentThumbLeftRef.current;
        const targetLeft = activeIndex * step;

        if (indicatorRef.current && !reducedMotion && typeof indicatorRef.current.animate === "function") {
          const anim = indicatorRef.current.animate(
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
            if (indicatorRef.current) indicatorRef.current.style.transform = "";
            try {
              anim.cancel();
            } catch {
              // ignore
            }
          };
        } else if (indicatorRef.current) {
          indicatorRef.current.style.transform = "";
        }
        haptics.dragTick();
      }
      return;
    }

    if (isCancelledRef.current) {
      isCancelledRef.current = false;
    }

    const relX = touch.clientX - rect.left - padding;
    const targetThumbLeft = relX - tabWidth / 2;
    const maxLeft = (tabCount - 1) * step;
    const clampedThumbLeft = Math.max(0, Math.min(targetThumbLeft, maxLeft));
    currentThumbLeftRef.current = clampedThumbLeft;

    if (indicatorRef.current && !reducedMotion) {
      indicatorRef.current.style.transform = `translateX(${clampedThumbLeft}px) scale(1.05, 0.94)`;
    }

    const clampedRelX = Math.max(0, Math.min(relX, innerWidth));
    const newIndex = Math.min(
      Math.floor(clampedRelX / (innerWidth / tabCount)),
      tabCount - 1,
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
      const padding = 6;
      const innerWidth = (rect?.width ?? 320) - 2 * padding;
      const gap = 4;
      const tabCount = tabs.length;
      const tabWidth = (innerWidth - (tabCount - 1) * gap) / tabCount;
      const step = tabWidth + gap;

      const finalIndex =
        !wasCancelled && targetIndex !== null && targetIndex >= 0
          ? targetIndex
          : activeIndex;
      const targetLeft = finalIndex * step;

      setIsDragging(false);
      setDragIndex(null);

      if (indicatorRef.current && !reducedMotion && typeof indicatorRef.current.animate === "function") {
        const anim = indicatorRef.current.animate(
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
          if (indicatorRef.current) {
            indicatorRef.current.style.transform = "";
          }
          try {
            anim.cancel();
          } catch {
            // ignore
          }
        };
      } else if (indicatorRef.current) {
        indicatorRef.current.style.transform = "";
      }

      if (!wasCancelled && targetIndex !== null && targetIndex >= 0) {
        if (targetIndex !== activeIndex) {
          haptics.dragSnap();
          onTabChange(targetIndex);
        } else {
          haptics.selection();
        }
      }
    } else {
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = "";
      }
      setIsDragging(false);
      setDragIndex(null);
    }
  };

  const handleTouchCancel = () => {
    if (hasDraggedRef.current && indicatorRef.current && !reducedMotion && typeof indicatorRef.current.animate === "function") {
      const rect = trackRef.current?.getBoundingClientRect();
      const padding = 6;
      const innerWidth = (rect?.width ?? 320) - 2 * padding;
      const gap = 4;
      const tabCount = tabs.length;
      const tabWidth = (innerWidth - (tabCount - 1) * gap) / tabCount;
      const step = tabWidth + gap;
      const startLeft = currentThumbLeftRef.current;
      const targetLeft = activeIndex * step;

      const anim = indicatorRef.current.animate(
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
        if (indicatorRef.current) indicatorRef.current.style.transform = "";
        try {
          anim.cancel();
        } catch {
          // ignore
        }
      };
    } else if (indicatorRef.current) {
      indicatorRef.current.style.transform = "";
    }

    touchStartRef.current = null;
    hasDraggedRef.current = false;
    isCancelledRef.current = false;
    setIsDragging(false);
    setDragIndex(null);
  };

  return (
    <div className="flex w-full justify-center">
      <div
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className={`glass-track flex w-full items-center gap-1 p-1.5 touch-none ${tabs.length > 2 ? "max-w-[520px]" : "max-w-[420px]"}`}
        role="tablist"
        aria-label={ariaLabel}
        data-active={activeIndex}
      >
        {/* Raised Glass Thumb Indicator */}
        <div
          ref={indicatorRef}
          className="glass-thumb pointer-events-none"
          style={{
            // Track padding is 6px per side and buttons are 4px apart (gap-1).
            width: `calc((100% - 12px - ${(tabs.length - 1) * 4}px) / ${tabs.length})`,
            transform: `translateX(calc(${displayIndex} * (100% + 4px)))`,
            transition: isDragging
              ? "none"
              : "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease",
          }}
          aria-hidden="true"
        />

        {/* Tab Buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === displayIndex;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[index] = el;
              }}
              id={`${tab.id}-tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.panelId}
              tabIndex={isActive ? 0 : -1}
              data-index={index}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault();
                  return;
                }
                if (index !== activeIndex) {
                  haptics.selection();
                }
                onTabChange(index);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative z-10 flex min-w-0 flex-1 select-none items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:gap-2 sm:px-5 sm:text-sm ${
                isActive
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  : "text-white/55 hover:text-white/85"
              }`}
            >
              {tab.icon && (
                <span
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-cyan-200 drop-shadow-[0_0_6px_rgba(103,232,249,0.6)]"
                      : "text-white/45"
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span className="whitespace-nowrap tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

