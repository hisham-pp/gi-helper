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

  await expect(page).toHaveURL(/\/inventory\/materials$/);
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

test("GOOD import fills every tab and the export keeps it all", async ({ page }) => {
  // /inventory redirects to its Materials page
  await page.goto("/inventory");
  await expect(page).toHaveURL(/\/inventory\/materials$/);
  await page.getByRole("button", { name: "Import .GOOD" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("GOOD file")
    .setInputFiles(path.join(process.cwd(), "tests", "e2e", "fixtures", "account.good.json"));
  await expect(dialog.getByText("Characters 3")).toBeVisible();
  await dialog.getByRole("button", { name: "Import", exact: true }).click();
  await expect(dialog).toBeHidden();

  // Materials: catalog items as cards (both bag tabs), the rest kept in the note
  await expect(page.getByText("Hero's Wit").first()).toBeVisible();
  await expect(page.getByText("Qingxin").first()).toBeVisible();
  await expect(page.getByText(/1 more material from your GOOD import/)).toBeVisible();

  const sections = page.getByRole("navigation", { name: "Inventory sections" });
  await sections.getByRole("link", { name: /^Characters/ }).click();
  await expect(page).toHaveURL(/\/inventory\/characters$/);
  await expect(page.getByText("Traveler (Anemo)")).toBeVisible();
  await expect(page.getByText("Furina").first()).toBeVisible();

  await sections.getByRole("link", { name: /^Weapons/ }).click();
  await expect(page.getByText("Splendor of Tranquil Waters")).toBeVisible();
  // A key newer than our data still shows, named from the key
  await expect(page.getByText("Quantum Catalyst")).toBeVisible();

  await sections.getByRole("link", { name: /^Artifacts/ }).click();
  await expect(page).toHaveURL(/\/inventory\/artifacts$/);
  await expect(page.getByText("CRIT Rate 10.5%")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export \.GOOD/ }).click();
  const good = JSON.parse(await readFile(await (await downloadPromise).path(), "utf8"));
  expect(good.version).toBe(3);
  expect(good.characters).toHaveLength(3);
  expect(good.weapons).toHaveLength(4);
  expect(good.artifacts).toHaveLength(3);
  expect(good.artifacts[0].id).toBeUndefined();
  expect(good.materials).toMatchObject({ HerosWit: 286, Qingxin: 40, Mora: 1500000 });
});

test("database pages: characters, weapons and artifact sets", async ({ page }) => {
  await page.goto("/db/characters");
  await expect(page.getByRole("heading", { name: "Characters", exact: true })).toBeVisible();
  await page.getByPlaceholder("Search characters by name or title...").fill("Furina");
  await expect(page.getByRole("heading", { name: "Furina" })).toBeVisible();
  // The top bar's Database link is current on every database page
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Database" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("navigation", { name: "Database" }).getByRole("link", { name: "Weapons" }).click();
  await expect(page).toHaveURL(/\/db\/weapons$/);
  await expect(page.getByRole("heading", { name: "Weapons", exact: true })).toBeVisible();
  await page.getByPlaceholder("Search weapons by name or passive...").fill("Mistsplitter");
  await expect(page.getByRole("heading", { name: "Mistsplitter Reforged" })).toBeVisible();

  await page.goto("/db/artifacts");
  await page.getByPlaceholder("Search sets, pieces or bonuses...").fill("Gladiator");
  await expect(page.getByRole("heading", { name: "Gladiator's Finale" })).toBeVisible();
  await expect(page.getByText("ATK +18%.")).toBeVisible();
});

test("materials directory search, and its old URL redirects", async ({ page }) => {
  await page.goto("/materials");
  await expect(page).toHaveURL(/\/db\/materials$/);
  await page.getByPlaceholder("Search materials by name, ID, or description...").fill("Hero's Wit");
  await expect(page.getByText("Hero's Wit").first()).toBeVisible();
  // Materials-tab items are listed too
  await page.getByPlaceholder("Search materials by name, ID, or description...").fill("Qingxin");
  await expect(page.getByText("Qingxin").first()).toBeVisible();
});

test("release notes list the newest release", async ({ page }) => {
  await page.goto("/versions");
  await expect(page.getByRole("heading", { name: "Release Notes", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: newestRelease().title, exact: true })).toBeVisible();
});

test("feedback form opens and closes (or the page says it's offline)", async ({ page }) => {
  const list = page.waitForResponse((res) => res.url().includes("/api/feedback?page="));
  await page.goto("/feedback");
  const res = await list;
  // Without Supabase (CI) the page says so and hides the form
  if ((await res.json().catch(() => null))?.error === "not_configured") {
    await expect(page.getByText("Feedback is offline")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send feedback" })).toHaveCount(0);
    return;
  }
  await page.getByRole("button", { name: "Send feedback" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});
