import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getLatestVersion, getVersions, RELEASE_FILE, RELEASES_PER_PAGE, releasePage } from "../src/lib/versions";

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

describe("Release paging (/versions shows 10, older load on request)", () => {
  const fake = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      title: `Release ${i}`,
      date: "2026-10-14",
      changes: [{ type: "new" as const, text: "x" }],
      version: `0.0.${n - i}`,
      slug: `0-0-${n - i}`,
    }));

  it("splits releases into pages of RELEASES_PER_PAGE, newest first", () => {
    const all = fake(23);
    assert.equal(RELEASES_PER_PAGE, 10);
    const p1 = releasePage(all, 1);
    const p3 = releasePage(all, 3);
    assert.equal(p1.items.length, 10);
    assert.equal(p1.items[0].slug, "0-0-23");
    assert.equal(p3.items.length, 3);
    assert.equal(p3.items.at(-1)?.slug, "0-0-1");
    assert.deepEqual([p1.totalPages, p1.total], [3, 23]);
  });

  it("has one page when everything fits, and none past the end", () => {
    assert.equal(releasePage(fake(4), 1).totalPages, 1);
    assert.equal(releasePage(fake(4), 2).items.length, 0);
    assert.equal(releasePage([], 1).totalPages, 1);
  });
});
