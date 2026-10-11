import test from "node:test";
import assert from "node:assert/strict";
import { resolveMaterial } from "../src/lib/ai/material-matcher";
import {
  getAiAdapter,
  listSupportedAdapters,
  extractJsonFromResponse,
} from "../src/lib/ai/adapters";
import { mapAiItemsToMaterials } from "../src/lib/ai/vision-scanner";

test("resolveMaterial matches canonical materials by ID", () => {
  const result = resolveMaterial("damaged-mask");
  assert.ok(result);
  assert.equal(result.id, "damaged-mask");
  assert.equal(result.name, "Damaged Mask");
  assert.equal(result.rarity, 1);
});

test("resolveMaterial matches Character EXP items (Hero's Wit, Adventurer's Experience, Wanderer's Advice)", () => {
  const heroWit = resolveMaterial("Hero's Wit");
  assert.ok(heroWit);
  assert.equal(heroWit.id, "hero-s-wit");
  assert.equal(heroWit.name, "Hero's Wit");
  assert.equal(heroWit.rarity, 4);

  const advExp = resolveMaterial("Adventurer's Experience");
  assert.ok(advExp);
  assert.equal(advExp.id, "adventurer-s-experience");
  assert.equal(advExp.rarity, 3);

  const wandAdv = resolveMaterial("Wanderer's Advice");
  assert.ok(wandAdv);
  assert.equal(wandAdv.id, "wanderer-s-advice");
  assert.equal(wandAdv.rarity, 2);
});

test("resolveMaterial matches Weapon EXP Ores", () => {
  const mystic = resolveMaterial("Mystic Enhancement Ore");
  assert.ok(mystic);
  assert.equal(mystic.id, "mystic-enhancement-ore");
  assert.equal(mystic.rarity, 3);

  const enhancement = resolveMaterial("Enhancement Ore");
  assert.ok(enhancement);
  assert.equal(enhancement.id, "enhancement-ore");
  assert.equal(enhancement.rarity, 1);
});

test("resolveMaterial matches canonical materials by exact and lower name", () => {
  const result = resolveMaterial("Night-Wind's Mystic Premonition");
  assert.ok(result);
  assert.equal(result.id, "night-wind-s-mystic-premonition");
  assert.equal(result.rarity, 3);
});

test("resolveMaterial matches quoted materials correctly", () => {
  const result = resolveMaterial('"Exalted Earth"');
  assert.ok(result);
  assert.equal(result.id, "-exalted-earth-");
});

test("resolveMaterial handles minor typos or spaces", () => {
  const result = resolveMaterial("slime condensate");
  assert.ok(result);
  assert.equal(result.id, "slime-condensate");
  assert.equal(result.rarity, 1);
});

test("Adapter registry returns all 5 adapters", () => {
  const adapters = listSupportedAdapters();
  assert.equal(adapters.length, 5);

  const gemini = getAiAdapter("gemini");
  assert.equal(gemini.providerId, "gemini");
  assert.equal(gemini.displayName, "Google Gemini");

  const openai = getAiAdapter("openai");
  assert.equal(openai.providerId, "openai");
  assert.equal(openai.displayName, "OpenAI");

  const claude = getAiAdapter("claude");
  assert.equal(claude.providerId, "claude");
  assert.equal(claude.displayName, "Anthropic Claude");

  const grok = getAiAdapter("grok");
  assert.equal(grok.providerId, "grok");
  assert.equal(grok.displayName, "xAI Grok");

  const custom = getAiAdapter("custom");
  assert.equal(custom.providerId, "custom");
  assert.equal(custom.displayName, "OpenAI-Compatible / Custom");
});

test("extractJsonFromResponse strips markdown code blocks", () => {
  const raw = '```json\n{\n  "items": [\n    { "id": "mora", "quantity": 500 }\n  ]\n}\n```';
  const parsed = extractJsonFromResponse(raw);
  assert.deepEqual(parsed, {
    items: [{ id: "mora", quantity: 500 }],
  });
});

test("mapAiItemsToMaterials maps raw AI outputs to canonical DetectedItem including EXP items", () => {
  const rawItems = [
    { name: "Hero's Wit", quantity: 286 },
    { name: "Adventurer's Experience", quantity: 90 },
    { name: "Wanderer's Advice", quantity: 24 },
  ];

  const { items, rawCount } = mapAiItemsToMaterials(rawItems);
  assert.equal(rawCount, 3);
  assert.equal(items.length, 3);

  assert.equal(items[0].id, "hero-s-wit");
  assert.equal(items[0].name, "Hero's Wit");
  assert.equal(items[0].quantity, 286);
  assert.equal(items[0].rarity, 4);

  assert.equal(items[1].id, "adventurer-s-experience");
  assert.equal(items[1].name, "Adventurer's Experience");
  assert.equal(items[1].quantity, 90);
  assert.equal(items[1].rarity, 3);

  assert.equal(items[2].id, "wanderer-s-advice");
  assert.equal(items[2].name, "Wanderer's Advice");
  assert.equal(items[2].quantity, 24);
  assert.equal(items[2].rarity, 2);
});
