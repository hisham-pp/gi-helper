"use client";

import React, { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
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
  const thumbRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevIndexRef = useRef(activeIndex);
  const reducedMotion = usePrefersReducedMotion();

  // Same squash-and-stretch as the scanner tab thumb.
  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    if (prevIndex === activeIndex || reducedMotion) return;

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

  return (
    // Equal-width columns sized to the widest option, so the thumb lines up exactly
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className="glass-track inline-grid auto-cols-fr grid-flow-col gap-1 p-1"
    >
      <div
        ref={thumbRef}
        aria-hidden="true"
        className="glass-thumb bottom-1 left-1 top-1"
        style={{
          width: `calc((100% - ${2 * PAD + (count - 1) * GAP}px) / ${count})`,
          transform: `translateX(calc(${activeIndex} * (100% + ${GAP}px)))`,
        }}
      />

      {options.map((option, index) => {
        const isActive = index === activeIndex;
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
            onClick={() => select(index)}
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
