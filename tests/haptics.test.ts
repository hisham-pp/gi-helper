import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  HapticFeedbackService,
  HAPTIC_PATTERNS,
  IHapticDriver,
  RawHapticPattern,
  VibrationDriver,
} from "../src/lib/haptics";

describe("HapticFeedbackService", () => {
  class MockDriver implements IHapticDriver {
    readonly name = "mock-driver";
    supported = true;
    triggeredPatterns: RawHapticPattern[] = [];
    cancelled = false;

    isSupported(): boolean {
      return this.supported;
    }

    trigger(pattern: RawHapticPattern): boolean {
      this.triggeredPatterns.push(pattern);
      return true;
    }

    cancel(): void {
      this.cancelled = true;
    }
  }

  it("should trigger selection preset with 12ms duration", () => {
    const driver = new MockDriver();
    const service = new HapticFeedbackService([driver]);

    const result = service.selection();
    assert.equal(result, true);
    assert.deepEqual(driver.triggeredPatterns, [HAPTIC_PATTERNS.selection]);
  });

  it("should trigger semantic presets correctly", () => {
    const driver = new MockDriver();
    const service = new HapticFeedbackService([driver]);

    service.light();
    service.dragTick();
    service.dragSnap();
    service.medium();
    service.heavy();
    service.success();
    service.warning();
    service.error();

    assert.deepEqual(driver.triggeredPatterns, [
      HAPTIC_PATTERNS.light,
      HAPTIC_PATTERNS.dragTick,
      HAPTIC_PATTERNS.dragSnap,
      HAPTIC_PATTERNS.medium,
      HAPTIC_PATTERNS.heavy,
      HAPTIC_PATTERNS.success,
      HAPTIC_PATTERNS.warning,
      HAPTIC_PATTERNS.error,
    ]);
  });

  it("should accept custom numeric and array patterns", () => {
    const driver = new MockDriver();
    const service = new HapticFeedbackService([driver]);

    service.trigger(75);
    service.trigger([10, 20, 30]);

    assert.deepEqual(driver.triggeredPatterns, [75, [10, 20, 30]]);
  });

  it("should bypass triggering when disabled option is true", () => {
    const driver = new MockDriver();
    const service = new HapticFeedbackService([driver]);

    const result = service.selection({ disabled: true });
    assert.equal(result, false);
    assert.equal(driver.triggeredPatterns.length, 0);
  });

  it("should fallback to the next driver if first driver is not supported", () => {
    const driver1 = new MockDriver();
    driver1.supported = false;

    const driver2 = new MockDriver();
    driver2.supported = true;

    const service = new HapticFeedbackService([driver1, driver2]);

    assert.equal(service.isSupported(), true);
    const result = service.selection();
    assert.equal(result, true);
    assert.equal(driver1.triggeredPatterns.length, 0);
    assert.deepEqual(driver2.triggeredPatterns, [HAPTIC_PATTERNS.selection]);
  });

  it("should call cancel on supporting drivers", () => {
    const driver = new MockDriver();
    const service = new HapticFeedbackService([driver]);

    service.cancel();
    assert.equal(driver.cancelled, true);
  });

  it("should gracefully handle VibrationDriver in non-browser environment", () => {
    const vibrationDriver = new VibrationDriver();
    assert.equal(vibrationDriver.isSupported(), false);
    assert.equal(vibrationDriver.trigger(12), false);
  });
});
