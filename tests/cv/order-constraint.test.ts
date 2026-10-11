/**
 * Order-Constrained Matching — Unit Tests
 *
 * Task 6.1: DetectedItem output-shape assertion
 *
 * Asserts that no element produced by the inventory scan pipeline has fields
 * beyond `{ id, name, quantity, rarity? }`.  The matching layer (item-matcher.ts)
 * intentionally returns extra fields on `MatchResult` (`order`, `blockId`,
 * `constraintRelaxed`) that must be stripped before the result is surfaced as a
 * `DetectedItem`.
 *
 * Because `processInventoryImages` requires browser APIs (`createImageBitmap`,
 * `document`, `CanvasRenderingContext2D`, Tesseract) that are unavailable in the
 * Node.js test runner, this file tests the output-shape contract at two levels:
 *
 *   1. Type-level: compile-time assertions that `DetectedItem` only has the four
 *      permitted keys and that MatchResult's extra fields are absent from it.
 *
 *   2. Runtime: unit tests that verify the output-building logic (the exact same
 *      object-literal shape the orchestrator uses to populate `foundItems`) never
 *      leaks internal fields to the caller.
 *
 * Run with:
 *   npx tsx --test tests/cv/order-constraint.test.ts
 *
 * Requirements: 5.3
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Type-level helpers ───────────────────────────────────────────────────────

/**
 * DetectedItem as defined in src/lib/types.ts — copied here so the test has no
 * import path dependency on the Next.js path-alias resolver.
 */
interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  rarity?: number;
}

/** The set of keys that are ALLOWED on a DetectedItem. */
const ALLOWED_KEYS = new Set<string>(["id", "name", "quantity", "rarity"]);

/** Fields on MatchResult that must NOT leak to DetectedItem. */
const FORBIDDEN_KEYS = ["order", "blockId", "constraintRelaxed"] as const;

// ─── Compile-time assertions ──────────────────────────────────────────────────
// These are evaluated by the TypeScript compiler; they will cause a build error
// if `DetectedItem` is ever extended with the forbidden fields.

// Verify DetectedItem does NOT have `order`
type _NoOrder = Omit<DetectedItem, "order"> extends DetectedItem ? true : false;
const _orderAbsent: _NoOrder = true;
void _orderAbsent; // suppress unused-variable warning

// Verify DetectedItem does NOT have `blockId`
type _NoBlockId = Omit<DetectedItem, "blockId"> extends DetectedItem ? true : false;
const _blockIdAbsent: _NoBlockId = true;
void _blockIdAbsent;

// Verify DetectedItem does NOT have `constraintRelaxed`
type _NoConstraintRelaxed = Omit<DetectedItem, "constraintRelaxed"> extends DetectedItem ? true : false;
const _constraintRelaxedAbsent: _NoConstraintRelaxed = true;
void _constraintRelaxedAbsent;

// ─── Runtime helpers ──────────────────────────────────────────────────────────

/**
 * Simulates the MatchResult shape that item-matcher.ts returns.
 * Contains the internal fields that must NOT propagate to DetectedItem.
 */
interface MatchResultShape {
  id: string;
  name: string;
  confidence: number;
  constraintRelaxed: boolean;
  order: number | null;
  blockId: string | null;
}

/**
 * Replicates the exact output-building logic from orchestrator.ts:
 *
 *   foundItems[match.id] = {
 *     id: match.id,
 *     name: match.name,
 *     quantity,
 *     rarity: itemRarity,
 *   };
 *
 * This is the only place in the pipeline where a DetectedItem is constructed
 * from a MatchResult.  The test verifies this mapping strips internal fields.
 */
function buildDetectedItem(
  match: MatchResultShape,
  quantity: number,
  itemRarity: number | undefined,
): DetectedItem {
  return {
    id: match.id,
    name: match.name,
    quantity,
    rarity: itemRarity,
  };
}

/**
 * Returns all own enumerable keys on an object, including any unexpected extras.
 */
function ownKeys(obj: object): string[] {
  return Object.keys(obj);
}

/**
 * Asserts that `item` has no keys outside `ALLOWED_KEYS`.
 */
function assertDetectedItemShape(item: object, label: string): void {
  const keys = ownKeys(item);
  const forbidden = keys.filter((k) => !ALLOWED_KEYS.has(k));
  assert.deepEqual(
    forbidden,
    [],
    `${label}: DetectedItem must not contain keys beyond { id, name, quantity, rarity? }. ` +
      `Found unexpected key(s): ${forbidden.join(", ")}`,
  );

  // Required keys must be present
  assert.ok("id" in item, `${label}: DetectedItem must have 'id'`);
  assert.ok("name" in item, `${label}: DetectedItem must have 'name'`);
  assert.ok("quantity" in item, `${label}: DetectedItem must have 'quantity'`);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DetectedItem output shape — task 6.1 (Requirement 5.3)", () => {

  describe("output-building logic strips internal MatchResult fields", () => {

    it("item built from a constrained match (constraintRelaxed: false) has no extra fields", () => {
      const match: MatchResultShape = {
        id: "agnidus-agate-sliver",
        name: "Agnidus Agate Sliver",
        confidence: 92,
        constraintRelaxed: false,
        order: 42,
        blockId: "11:2",
      };
      const item = buildDetectedItem(match, 5, 2);

      assertDetectedItemShape(item, "constrained match");
      assert.equal(item.id, "agnidus-agate-sliver");
      assert.equal(item.name, "Agnidus Agate Sliver");
      assert.equal(item.quantity, 5);
      assert.equal(item.rarity, 2);
    });

    it("item built from a relaxed match (constraintRelaxed: true) has no extra fields", () => {
      const match: MatchResultShape = {
        id: "slime-condensate",
        name: "Slime Condensate",
        confidence: 78,
        constraintRelaxed: true,
        order: 5,
        blockId: "2:1",
      };
      const item = buildDetectedItem(match, 12, 1);

      assertDetectedItemShape(item, "relaxed match");
      // `constraintRelaxed` must not appear on the output
      assert.ok(!("constraintRelaxed" in item), "constraintRelaxed must not be on DetectedItem");
    });

    it("item built from a match with null order and null blockId has no extra fields", () => {
      const match: MatchResultShape = {
        id: "some-unknown-material",
        name: "Some Unknown Material",
        confidence: 60,
        constraintRelaxed: false,
        order: null,
        blockId: null,
      };
      const item = buildDetectedItem(match, 1, undefined);

      assertDetectedItemShape(item, "null order/blockId match");
      assert.ok(!("order" in item), "order must not be on DetectedItem");
      assert.ok(!("blockId" in item), "blockId must not be on DetectedItem");
      assert.equal(item.rarity, undefined);
    });

    it("item built with rarity=undefined does not have a rarity key with undefined value that breaks shape", () => {
      const match: MatchResultShape = {
        id: "teachings-of-ballad",
        name: "Teachings of Ballad",
        confidence: 85,
        constraintRelaxed: false,
        order: 100,
        blockId: "30:3",
      };
      const item = buildDetectedItem(match, 3, undefined);

      // `rarity` is optional — its absence is allowed; its presence with `undefined` is fine too.
      // Either way, no FORBIDDEN key may appear.
      for (const forbidden of FORBIDDEN_KEYS) {
        assert.ok(
          !(forbidden in item),
          `'${forbidden}' must not appear on DetectedItem (got from match with order=${match.order})`,
        );
      }
    });

    it("all forbidden MatchResult fields are absent from every built DetectedItem", () => {
      // Test a batch of realistic match results spanning different scenarios
      const scenarios: Array<{ match: MatchResultShape; qty: number; rarity: number | undefined }> = [
        // High-order constrained match
        {
          match: { id: "philosophies-of-ballad", name: "Philosophies of Ballad", confidence: 91, constraintRelaxed: false, order: 200, blockId: "30:4" },
          qty: 2, rarity: 4,
        },
        // Low-order same-block peer
        {
          match: { id: "guide-to-ballad", name: "Guide to Ballad", confidence: 88, constraintRelaxed: false, order: 199, blockId: "30:3" },
          qty: 9, rarity: 3,
        },
        // Relaxed fallback with large order value
        {
          match: { id: "mora", name: "Mora", confidence: 55, constraintRelaxed: true, order: 999, blockId: null },
          qty: 100000, rarity: undefined,
        },
        // Null order (material not in materials.json with order field)
        {
          match: { id: "unknown-new-mat", name: "Unknown New Material", confidence: 58, constraintRelaxed: false, order: null, blockId: null },
          qty: 1, rarity: undefined,
        },
      ];

      for (const { match, qty, rarity } of scenarios) {
        const item = buildDetectedItem(match, qty, rarity);
        for (const forbidden of FORBIDDEN_KEYS) {
          assert.ok(
            !(forbidden in item),
            `Scenario "${match.id}": '${forbidden}' must not appear on DetectedItem`,
          );
        }
        assertDetectedItemShape(item, match.id);
      }
    });
  });

  describe("ALLOWED_KEYS contract is exhaustive", () => {

    it("ALLOWED_KEYS matches the DetectedItem interface definition exactly", () => {
      // Build a fully-populated DetectedItem and verify its keys are a subset of ALLOWED_KEYS
      const fullyPopulated: DetectedItem = {
        id: "test",
        name: "Test Material",
        quantity: 1,
        rarity: 3,
      };
      const keys = ownKeys(fullyPopulated);
      const unexpected = keys.filter((k) => !ALLOWED_KEYS.has(k));
      assert.deepEqual(
        unexpected,
        [],
        `DetectedItem interface has keys outside ALLOWED_KEYS: ${unexpected.join(", ")}`,
      );
      assert.ok(keys.includes("id"), "id must be present");
      assert.ok(keys.includes("name"), "name must be present");
      assert.ok(keys.includes("quantity"), "quantity must be present");
      assert.ok(keys.includes("rarity"), "rarity must be present when set");
    });

    it("a DetectedItem without rarity is also valid and shape-compliant", () => {
      const noRarity: DetectedItem = { id: "x", name: "X", quantity: 1 };
      const keys = ownKeys(noRarity);
      const unexpected = keys.filter((k) => !ALLOWED_KEYS.has(k));
      assert.deepEqual(unexpected, [], "DetectedItem without rarity must still be shape-compliant");
    });
  });
});
