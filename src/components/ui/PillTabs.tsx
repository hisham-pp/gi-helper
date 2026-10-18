"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
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
  const reducedMotion = usePrefersReducedMotion();
  const activeIndex = options.findIndex((o) => o.value === value);
  const accent = options[activeIndex]?.accent ?? DEFAULT_ACCENT;
  const prevIndexRef = useRef(activeIndex);

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

  // Same squash-and-stretch as the scanner tab thumb
  useLayoutEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (prevIndex === activeIndex || activeIndex < 0 || reducedMotion) return;
    thumbRef.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.1 0.88", offset: 0.35 },
        { scale: "0.96 1.05", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [activeIndex, reducedMotion]);

  return (
    <div
      ref={trackRef}
      role="group"
      aria-label={ariaLabel}
      className={`glass-track inline-flex shrink-0 items-center gap-1 p-1 ${className}`}
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
            transition: reducedMotion
              ? "none"
              : "transform 550ms cubic-bezier(0.34, 1.35, 0.5, 1), width 550ms cubic-bezier(0.34, 1.35, 0.5, 1), opacity 200ms",
          } as React.CSSProperties
        }
      />

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            data-tab
            onClick={() => {
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
