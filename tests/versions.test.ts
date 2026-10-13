import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestVersion, getVersions, RELEASE_FILE } from "../src/lib/versions";

function writeRelease(dir: string, folder: string, contents: unknown) {
  mkdirSync(path.join(dir, folder), { recursive: true });
  const body = typeof contents === "string" ? contents : JSON.stringify(contents);
  writeFileSync(path.join(dir, folder, RELEASE_FILE), body, "utf-8");
}

const release = (title: string) => ({
  title,
  date: "2026-10-13",
  changes: [{ type: "new", text: `${title} change` }],
});

describe("Release notes (src/data/versions)", () => {
  it("every committed release.json is valid", () => {
    const versions = getVersions();
    assert.ok(versions.length > 0, "expected at least one release folder");
    for (const v of versions) {
      assert.match(v.version, /^\d+\.\d+\.\d+$/);
      assert.ok(v.changes.length > 0, `v${v.version} has no changes`);
    }
  });

  describe("loader", () => {
    let dir: string;

    before(() => {
      dir = mkdtempSync(path.join(tmpdir(), "gi-versions-"));
    });

    after(() => {
      rmSync(dir, { recursive: true, force: true });
    });

    it("returns an empty list when the folder does not exist", () => {
      assert.deepEqual(getVersions(path.join(dir, "missing")), []);
      assert.equal(getLatestVersion(path.join(dir, "missing")), undefined);
    });

    it("derives the version from the folder name and sorts newest first numerically", () => {
      const root = path.join(dir, "sorted");
      writeRelease(root, "0-0-2", release("two"));
      writeRelease(root, "0-0-10", release("ten"));
      writeRelease(root, "0-1-0", release("minor"));
      writeRelease(root, "1-0-0", release("major"));
      // Not a version folder: ignored
      mkdirSync(path.join(root, "drafts"), { recursive: true });

      const versions = getVersions(root);
      assert.deepEqual(
        versions.map((v) => v.version),
        ["1.0.0", "0.1.0", "0.0.10", "0.0.2"],
      );
      assert.equal(versions[3].slug, "0-0-2");
      assert.equal(getLatestVersion(root)?.title, "major");
    });

    it("throws with the file path when release.json is missing", () => {
      const root = path.join(dir, "missing-file");
      mkdirSync(path.join(root, "0-0-3"), { recursive: true });
      assert.throws(() => getVersions(root), /Missing release\.json.*0-0-3/);
    });

    it("throws on malformed JSON", () => {
      const root = path.join(dir, "bad-json");
      writeRelease(root, "0-0-3", "{ not json");
      assert.throws(() => getVersions(root), /Invalid JSON/);
    });

    it("throws on schema errors, naming the field", () => {
      const root = path.join(dir, "bad-schema");
      writeRelease(root, "0-0-3", { ...release("x"), date: "13/10/2026" });
      assert.throws(() => getVersions(root), /date: date must be YYYY-MM-DD/);

      const root2 = path.join(dir, "bad-type");
      writeRelease(root2, "0-0-3", { ...release("x"), changes: [{ type: "misc", text: "x" }] });
      assert.throws(() => getVersions(root2), /changes\.0\.type/);
    });
  });
});
