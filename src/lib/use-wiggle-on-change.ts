"use client";

import { useEffect, useRef } from "react";

/**
 * How strong the squash is: "card" for large surfaces (filter bars,
 * pagination), "control" for short ones (text fields, dropdown pills), where
 * the card's 1.5% squash would be too small to see.
 */
export type WiggleSize = "card" | "control";

const KEYFRAMES: Record<WiggleSize, Keyframe[]> = {
  card: [
    { scale: "1 1" },
    { scale: "1.006 0.985", offset: 0.35 },
    { scale: "0.998 1.006", offset: 0.7 },
    { scale: "1 1" },
  ],
  control: [
    { scale: "1 1" },
    { scale: "1.012 0.92", offset: 0.35 },
    { scale: "0.997 1.035", offset: 0.7 },
    { scale: "1 1" },
  ],
};

const DURATION_MS: Record<WiggleSize, number> = { card: 520, control: 460 };

/** Plays the small squash-and-stretch once on `el` (callers check reduced motion). */
export function playWiggle(el: HTMLElement | null | undefined, size: WiggleSize = "card"): void {
  el?.animate(KEYFRAMES[size], { duration: DURATION_MS[size], easing: "ease-out" });
}

/** Plays a small squash-and-stretch on `ref` whenever `trigger` changes (not on mount). */
export function useWiggleOnChange(
  ref: React.RefObject<HTMLElement | null>,
  trigger: unknown,
  reducedMotion: boolean,
  size: WiggleSize = "card",
) {
  const prevRef = useRef(trigger);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = trigger;
    if (prev === trigger || reducedMotion) return;

    playWiggle(ref.current, size);
  }, [ref, trigger, reducedMotion, size]);
}
