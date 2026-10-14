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
  const migration = fs.readdirSync(dir).find((name) => name.endsWith("_scan_stats.sql"));
  assert.ok(migration, "scan_stats migration not found");
  const sql = fs.readFileSync(path.join(dir, migration), "utf8");
  const check = sql.match(/scanner in \(([^)]*)\)/);
  assert.ok(check, "scanner check not found");
  const kinds = check[1].split(",").map((part) => part.trim().replace(/'/g, ""));
  assert.deepEqual(kinds, [...SCANNERS]);
});
