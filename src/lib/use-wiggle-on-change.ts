"use client";

import { useEffect, useRef } from "react";

/** Plays a small squash-and-stretch on `ref` whenever `trigger` changes (not on mount). */
export function useWiggleOnChange(
  ref: React.RefObject<HTMLElement | null>,
  trigger: unknown,
  reducedMotion: boolean,
) {
  const prevRef = useRef(trigger);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = trigger;
    if (prev === trigger || reducedMotion) return;

    ref.current?.animate(
      [
        { scale: "1 1" },
        { scale: "1.006 0.985", offset: 0.35 },
        { scale: "0.998 1.006", offset: 0.7 },
        { scale: "1 1" },
      ],
      { duration: 520, easing: "ease-out" },
    );
  }, [ref, trigger, reducedMotion]);
}
