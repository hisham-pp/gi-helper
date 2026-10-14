import { readFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

// Named *.spec.ts so `pnpm test` (node:test over tests/**/*.test.ts) skips it.

/** The newest src/data/versions/<major>-<minor>-<patch>/release.json. */
function newestRelease(): { title: string } {
  const dir = path.join(process.cwd(), "src", "data", "versions");
  const [newest] = readdirSync(dir)
    .map((name) => ({ name, parts: name.split("-").map(Number) }))
    .sort((a, b) => b.parts[0] - a.parts[0] || b.parts[1] - a.parts[1] || b.parts[2] - a.parts[2]);
  return JSON.parse(readFileSync(path.join(dir, newest.name, "release.json"), "utf8"));
}

test("sample screenshot: scan, review, inventory and GOOD export", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try a sample", exact: true }).click();

  // The on-device scan runs in workers, then the review modal opens.
  const confirm = page.getByRole("button", { name: /Confirm & Add to Inventory/ });
  await expect(confirm).toBeVisible({ timeout: 90_000 });
  await confirm.click();

  await expect(page).toHaveURL(/\/inventory$/);
  await expect(page.getByText("Hero's Wit").first()).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export \.GOOD/ }).click();
  const download = await downloadPromise;
  const good = JSON.parse(await readFile(await download.path(), "utf8"));

  expect(good.format).toBe("GOOD");
  expect(good.version).toBe(2);
  const keys = Object.keys(good.materials);
  // 21 cards in this screenshot (tests/material-detector/ground-truth.json).
  expect(keys.length).toBeGreaterThanOrEqual(18);
  for (const key of keys) expect(key).toMatch(/^[A-Z][A-Za-z0-9]*$/);
  expect(good.materials.HerosWit).toBe(94);
});

test("materials directory search", async ({ page }) => {
  await page.goto("/materials");
  await page.getByPlaceholder("Search materials by name, ID, or description...").fill("Hero's Wit");
  await expect(page.getByText("Hero's Wit").first()).toBeVisible();
});

test("release notes list the newest release", async ({ page }) => {
  await page.goto("/versions");
  await expect(page.getByRole("heading", { name: "Release Notes", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: newestRelease().title, exact: true })).toBeVisible();
});

test("feedback form opens and closes", async ({ page }) => {
  await page.goto("/feedback");
  await page.getByRole("button", { name: "Send feedback" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});
