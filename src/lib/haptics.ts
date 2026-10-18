"use client";

import { useCallback, useMemo } from "react";

/**
 * Universal Haptic Feedback System for Mobile Web & Progressive Web Apps (PWA).
 *
 * Implements clean code principles:
 * - Single Responsibility Principle (SRP): Drivers isolate platform hardware details,
 *   Service coordinates business rules and normalization.
 * - Strategy Pattern: Vibration API Driver -> iOS WebKit Switch Hack Driver -> No-op Fallback.
 * - Robust & SSR Safe: Works seamlessly in Next.js SSR / SSG without runtime errors.
 * - Battery & UX Conscious: Sub-50ms micro-pulses tailored for responsive tab switching and controls.
 */

/**
 * Tactile pattern presets with proven durations (in milliseconds).
 * Alternating numbers in arrays denote [vibrate, pause, vibrate...].
 */
export const HAPTIC_PATTERNS = {
  /** Ultra-crisp tap (12ms) ideal for tabs, switches, segmented controls, and chips. */
  selection: 12,
  /** Light pulse (15ms) for general button clicks and selection states. */
  light: 15,
  /** Medium pulse (25ms) for primary actions, confirmations, and modal transitions. */
  medium: 25,
  /** Heavy pulse (40ms) for destructive actions or important triggers. */
  heavy: 40,
  /** Success feedback: two short pulses with a crisp pause [15ms, 50ms, 20ms]. */
  success: [15, 50, 20],
  /** Warning feedback: double alert pulse [25ms, 60ms, 25ms]. */
  warning: [25, 60, 25],
  /** Error feedback: triple alert pulse [40ms, 60ms, 40ms, 60ms, 50ms]. */
  error: [40, 60, 40, 60, 50],
} as const;

export type HapticPresetName = keyof typeof HAPTIC_PATTERNS;

/**
 * Raw pattern duration in milliseconds, or alternating pulse/pause durations.
 */
export type RawHapticPattern = number | readonly number[];

/**
 * Valid haptic input: a predefined semantic preset name, a single pulse duration (ms),
 * or an array of alternating pulse and pause durations.
 */
export type HapticPattern =
  HapticPresetName | number | readonly number[] | number[];

export interface HapticFeedbackOptions {
  /** If true, vibration is bypassed. */
  disabled?: boolean;
  /**
   * If true, checks `window.matchMedia("(prefers-reduced-motion: reduce)")`.
   * Bypasses vibration if reduced motion is requested. Defaults to false.
   */
  checkReducedMotion?: boolean;
  /**
   * If true, only triggers on touch-capable devices or standalone PWA mode.
   * Defaults to false (browsers without vibration motors will safely no-op).
   */
  mobileOnly?: boolean;
}

/**
 * Driver interface defining the contract for hardware vibration engines.
 */
export interface IHapticDriver {
  readonly name: string;
  isSupported(): boolean;
  trigger(pattern: RawHapticPattern): boolean;
  cancel?(): void;
}

/**
 * Detects whether the current device is a touch-capable client.
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

/**
 * Detects whether the web application is running in installed / standalone PWA mode.
 */
export function isPwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

/**
 * Standard Web Vibration API driver (navigator.vibrate).
 * Active on Android Chromium browsers, Edge, Firefox, and Samsung Internet.
 */
export class VibrationDriver implements IHapticDriver {
  readonly name = "vibration-api";

  isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    );
  }

  trigger(pattern: RawHapticPattern): boolean {
    if (!this.isSupported()) return false;
    try {
      if (typeof pattern === "number") {
        return navigator.vibrate(pattern);
      }
      return navigator.vibrate([...pattern]);
    } catch {
      return false;
    }
  }

  cancel(): void {
    if (!this.isSupported()) return;
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore
    }
  }
}

/**
 * Driver utilizing the iOS Safari 17.4+ WebKit switch haptic mechanism.
 *
 * Background:
 * Apple historically omitted `navigator.vibrate()` in Safari/WebKit on iOS.
 * However, iOS 17.4+ / iOS 18 added native Taptic Engine feedback to `<input type="checkbox" switch>`.
 * Clicking its associated `<label>` during a legitimate user interaction triggers native haptic response.
 */
export class IosSwitchDriver implements IHapticDriver {
  readonly name = "ios-switch-hack";

  private label: HTMLLabelElement | null = null;
  private input: HTMLInputElement | null = null;
  private isAvailable: boolean | null = null;

  isSupported(): boolean {
    if (this.isAvailable !== null) return this.isAvailable;
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const lacksVibrate = !("vibrate" in navigator);
    this.isAvailable = isIos && lacksVibrate;
    return this.isAvailable;
  }

  private ensureMounted(): boolean {
    if (this.label && this.input) return true;
    if (typeof document === "undefined" || !document.body) return false;

    try {
      // Create a singleton off-screen container
      const container = document.createElement("div");
      container.id = "pwa-haptic-bridge";
      container.setAttribute("aria-hidden", "true");
      container.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;width:1px;height:1px;overflow:hidden;z-index:-1;";

      const id = "ios-haptic-switch-control";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.tabIndex = -1;
      // 'switch' attribute activates Safari's native Taptic Engine feedback
      input.setAttribute("switch", "");

      const label = document.createElement("label");
      label.htmlFor = id;
      label.tabIndex = -1;
      label.appendChild(input);

      container.appendChild(label);
      document.body.appendChild(container);

      this.label = label;
      this.input = input;
      return true;
    } catch {
      return false;
    }
  }

  trigger(pattern: RawHapticPattern): boolean {
    if (!this.isSupported()) return false;
    if (!this.ensureMounted() || !this.label) return false;

    try {
      if (Array.isArray(pattern) && pattern.length > 1) {
        // First pulse executes synchronously in the user gesture event loop
        this.label.click();

        let accumulatedDelay = 0;
        for (let i = 1; i < pattern.length; i += 2) {
          accumulatedDelay += pattern[i] ?? 0;
          const nextDuration = pattern[i + 1];
          if (nextDuration) {
            setTimeout(() => {
              try {
                this.label?.click();
              } catch {
                // Ignore
              }
            }, accumulatedDelay);
            accumulatedDelay += nextDuration;
          }
        }
      } else {
        this.label.click();
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Composite manager coordinating driver resolution and pattern dispatching.
 */
export class HapticFeedbackService {
  private readonly drivers: IHapticDriver[];

  constructor(drivers?: IHapticDriver[]) {
    this.drivers = drivers ?? [new VibrationDriver(), new IosSwitchDriver()];
  }

  /**
   * Resolves whether any driver in the pipeline is supported in the current environment.
   */
  isSupported(): boolean {
    return this.drivers.some((driver) => driver.isSupported());
  }

  /**
   * Resolves a pattern input to a raw duration or duration array.
   */
  private resolvePattern(pattern: HapticPattern): RawHapticPattern {
    if (typeof pattern === "string") {
      return HAPTIC_PATTERNS[pattern] ?? HAPTIC_PATTERNS.selection;
    }
    return pattern;
  }

  /**
   * Executes haptic feedback based on the provided pattern and options.
   */
  trigger(
    pattern: HapticPattern = "selection",
    options: HapticFeedbackOptions = {},
  ): boolean {
    if (options.disabled) return false;

    if (options.mobileOnly && !isTouchDevice() && !isPwa()) {
      return false;
    }

    if (
      options.checkReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }

    const resolved = this.resolvePattern(pattern);

    for (const driver of this.drivers) {
      if (driver.isSupported()) {
        const success = driver.trigger(resolved);
        if (success) return true;
      }
    }

    return false;
  }

  /**
   * Ultra-crisp tap (12ms) ideal for switching tabs, segmented controls, or filter pills.
   */
  selection(options?: HapticFeedbackOptions): boolean {
    return this.trigger("selection", options);
  }

  /**
   * Light tactile tap (15ms).
   */
  light(options?: HapticFeedbackOptions): boolean {
    return this.trigger("light", options);
  }

  /**
   * Medium tactile pulse (25ms).
   */
  medium(options?: HapticFeedbackOptions): boolean {
    return this.trigger("medium", options);
  }

  /**
   * Heavy tactile pulse (40ms).
   */
  heavy(options?: HapticFeedbackOptions): boolean {
    return this.trigger("heavy", options);
  }

  /**
   * Two crisp pulses indicating a successful action.
   */
  success(options?: HapticFeedbackOptions): boolean {
    return this.trigger("success", options);
  }

  /**
   * Warning alert pattern.
   */
  warning(options?: HapticFeedbackOptions): boolean {
    return this.trigger("warning", options);
  }

  /**
   * Error alert pattern.
   */
  error(options?: HapticFeedbackOptions): boolean {
    return this.trigger("error", options);
  }

  /**
   * Cancels any ongoing vibration pattern immediately.
   */
  cancel(): void {
    for (const driver of this.drivers) {
      if (driver.cancel) {
        driver.cancel();
      }
    }
  }
}

/**
 * Singleton instance of the HapticFeedbackService.
 */
export const hapticFeedback = new HapticFeedbackService();

/**
 * Short alias for hapticFeedback.
 */
export const haptics = hapticFeedback;

/**
 * Functional shortcut to trigger haptic feedback.
 */
export function triggerHaptic(
  pattern: HapticPattern = "selection",
  options?: HapticFeedbackOptions,
): boolean {
  return hapticFeedback.trigger(pattern, options);
}

/**
 * React hook providing convenient, memoized access to haptic feedback methods.
 */
export function useHapticFeedback(defaultOptions?: HapticFeedbackOptions) {
  const trigger = useCallback(
    (pattern: HapticPattern = "selection", options?: HapticFeedbackOptions) => {
      return hapticFeedback.trigger(pattern, { ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const selection = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.selection({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const light = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.light({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const medium = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.medium({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const heavy = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.heavy({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const success = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.success({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const warning = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.warning({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const error = useCallback(
    (options?: HapticFeedbackOptions) => {
      return hapticFeedback.error({ ...defaultOptions, ...options });
    },
    [defaultOptions],
  );

  const cancel = useCallback(() => {
    hapticFeedback.cancel();
  }, []);

  return useMemo(
    () => ({
      trigger,
      selection,
      light,
      medium,
      heavy,
      success,
      warning,
      error,
      cancel,
      isSupported: () => hapticFeedback.isSupported(),
      isPwa,
      isTouchDevice,
    }),
    [trigger, selection, light, medium, heavy, success, warning, error, cancel],
  );
}
