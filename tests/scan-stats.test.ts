import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isSampleScan, markSampleFile, SCANNERS } from "../src/lib/scan-stats";

const file = (name: string) => new File(["x"], name, { type: "image/jpeg" });

test("only scans of the sample files are skipped", () => {
  const sample = file("GenshinImpact_Sample_Inventory.jpg");
  markSampleFile(sample);
  // Same name as the sample, but picked by the visitor: counts
  const lookalike = file("GenshinImpact_Sample_Inventory.jpg");

  assert.equal(isSampleScan([sample]), true);
  assert.equal(isSampleScan([lookalike]), false);
  assert.equal(isSampleScan([sample, lookalike]), false);
  assert.equal(isSampleScan([]), false);
});

test("scanner kinds match the database check", () => {
  const dir = path.join(process.cwd(), "supabase", "migrations");
  const migration = fs.readdirSync(dir).find((name) => /^\d+_scan_stats\.sql$/.test(name));
  assert.ok(migration, "scan_stats migration not found");
  const sql = fs.readFileSync(path.join(dir, migration), "utf8");
  const check = sql.match(/scanner in \(([^)]*)\)/);
  assert.ok(check, "scanner check not found");
  const kinds = check[1].split(",").map((part) => part.trim().replace(/'/g, ""));
  assert.deepEqual(kinds, [...SCANNERS]);
});

test("toScanStats reads the database and Realtime payload, filling gaps with 0", async () => {
  const { toScanStats } = await import("../src/lib/scan-stats");
  // Realtime adds its own message id; extra fields are ignored
  assert.deepEqual(
    toScanStats({ id: "x", total: 5, by_scanner: { screenshot: 4, video: 1 } } as never),
    { total: 5, byScanner: { screenshot: 4, video: 1, ai: 0 } },
  );
  assert.deepEqual(toScanStats({ total: "7" as never, by_scanner: {} }), {
    total: 7,
    byScanner: { screenshot: 0, video: 0, ai: 0 },
  });
});
